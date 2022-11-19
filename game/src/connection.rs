use anyhow::{Context, Result};
use encoding::server::{self, PlayerStart, ServerMessage};
use encoding::version::VERSION;
use futures::stream::{SplitSink, SplitStream};
use futures::{StreamExt, AsyncWrite, Sink, SinkExt, Stream};
use log::{error, warn};
use tokio::sync::mpsc::Sender;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{tungstenite, WebSocketStream};

use std::io::ErrorKind;
use tokio::io::{AsyncRead, BufReader, BufWriter};

use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::tcp::{OwnedReadHalf, OwnedWriteHalf},
};

#[derive(clap::ValueEnum, Clone, Debug)]
pub enum SerializationType {
    JSON = 0,
    Deku = 1,
}

pub enum ConnectionError {
    Data,
    Message,
    WebSocketError(tungstenite::Error),
}

pub enum ConnectionMessage {
    Close,
    Msg(ServerMessage),
    Error(ConnectionError),
}

fn deserialize(vec: Vec<u8>, ser: &SerializationType) -> Result<ServerMessage> {
    if let SerializationType::JSON = ser {
        return serde_json::from_slice(&vec).context("error while decoding json");
    }

    return ServerMessage::deserialize(&vec);
}

pub async fn handle_incoming_messages(
    ident: usize,
    mut read: impl Stream<Item = Result<Message, tungstenite::Error>> + Unpin + Send,
    tx: Sender<ConnectionMessage>,
    ser: SerializationType,
) -> Result<()> {
    loop {
        match read.next().await {
            Some(Ok(Message::Binary(msg))) => {
                let msg = ConnectionMessage::Msg(deserialize(msg, &ser)?);
                let _ = tx.send(msg).await;
            }

            Some(Ok(Message::Text(msg))) => {
                error!(
                    "received text message from {}.  removing connection from game",
                    ident
                );
                let msg = ConnectionMessage::Error(ConnectionError::Message);
                let _ = tx.send(msg).await;
                break;
            }

            // control frames
            Some(Ok(_)) => {}

            Some(Err(e)) => {
                error!("error from the websocket layer: {}", e);
                let msg = ConnectionMessage::Error(ConnectionError::WebSocketError(e));
                let _ = tx.send(msg).await;
                break;
            }

            None => {
                let _ = tx.send(ConnectionMessage::Close).await;
                break;
            }
        };
    }

    return Ok(());
}
