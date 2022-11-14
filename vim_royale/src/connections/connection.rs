use anyhow::{Context, Result};
use encoding::server::ServerMessage;
use futures::{AsyncWrite, Stream, Sink, SinkExt};
use futures::stream::{SplitSink, SplitStream};
use log::{error, warn};
use tokio_tungstenite::{WebSocketStream, tungstenite};
use tokio_tungstenite::tungstenite::Message;
use futures_util::StreamExt;

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

fn deserialize(vec: Vec<u8>, ser: &SerializationType) -> Result<ServerMessage> {
    if let SerializationType::JSON = ser {
        return serde_json::from_slice(&vec).context("error while decoding json");
    }

    return ServerMessage::deserialize(&vec);
}

pub async fn handle_incoming_messages(
    ident: usize,
    mut read: impl Stream<Item = Result<Message, tungstenite::Error>> + Unpin + Send,
    mut write: impl Sink<Message> + Unpin + Sync,
    ser: SerializationType,
) -> Result<()> {

    loop {
        let msg = match read.next().await {
            Some(Ok(Message::Binary(msg))) => msg,
            Some(Ok(Message::Text(msg))) => {
                error!("received text message from {}.  removing connection from game", ident);
                break;
            },

            // control frames
            Some(Ok(_)) => {
                continue;
            },

            Some(Err(e)) => {
                error!("error from the websocket layer: {}", e);
                break;
            },
            None => {
                break;
            }
        };

        /* 
        let msg = deserialize(msg, &ser)?;
        let msg = match ser {
            SerializationType::Deku => msg.serialize()?,
            SerializationType::JSON => serde_json::to_vec(&msg)?,
        };
        */
        println!("has message {:?}", msg);

        let out = Message::Binary(msg);
        write.send(out).await.ok();
    }

    write.close().await.ok();

    return Ok(());
}
