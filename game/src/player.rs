use tokio::net::TcpStream;
use anyhow::{Result, Context};
use encoding::server::{ServerMessage, self};
use tokio_tungstenite::{tungstenite, tungstenite::Error, WebSocketStream};
use futures::{SinkExt, StreamExt, stream::{SplitSink, SplitStream}};

use crate::connection::{ConnectionMessage, SerializationType};

pub type PlayerWebStream = SplitStream<WebSocketStream<TcpStream>>;
pub type PlayerWebSink = SplitSink<WebSocketStream<TcpStream>, tungstenite::Message>;

pub struct PlayerSink {
    pub id: u8,
    pub seq_nu: u16,
    pub sink: PlayerWebSink,
    pub ser_type: SerializationType,
}

pub struct PlayerStream {
    pub id: u8,
    pub stream: PlayerWebStream,
    pub ser_type: SerializationType,
}

fn deserialize(vec: Vec<u8>, ser: &SerializationType) -> Result<ServerMessage> {
    if let SerializationType::JSON = ser {
        return serde_json::from_slice(&vec).context("error while decoding json");
    }

    return ServerMessage::deserialize(&vec);
}

impl PlayerStream {
    pub fn new(id: u8, stream: PlayerWebStream) -> Self {
        return Self {
            id,
            stream,
            ser_type: SerializationType::Deku,
        };
    }

    pub async fn next_message(&mut self) -> Result<ConnectionMessage> {
        /*
        match self.stream.next().await {
            Some(Ok(Message::Binary(msg))) => {
                return Ok(ConnectionMessage::Msg(deserialize(msg, &ser)?));
            }

            Some(Ok(Message::Text(msg))) => {
                return Ok(ConnectionMessage::Error(ConnectionError::Text));
            }

            // control frames
            Some(Ok(_)) => {
                return Ok(ConnectionMessage::ControlMessage);
            }

            Some(Err(e)) => {
                let e = ConnectionMessage::Error(ConnectionError::WebSocketError(e));
                return Ok(e);
            }

            None => {
                return Ok(ConnectionMessage::Close);
            }
        };
        */
        todo!("me daddy");
    }
}

impl PlayerSink {
    pub fn new(id: u8, sink: PlayerWebSink) -> PlayerSink {
        return PlayerSink {
            id,
            sink,
            seq_nu: 0,
            ser_type: SerializationType::Deku,
        };
    }

    pub async fn send(&mut self, msg: server::Message) -> Result<()> {
        self.seq_nu += 1;

        let msg = ServerMessage::new(self.seq_nu, msg);
        let msg = msg.serialize()?;

        // TODO: Somehow i got into this situation where i don't know how to
        // write.  i really hate this trait thing.
        // PlayerSink.write(&mut self.sink, &msg).await;

        // self.sink.write_all(tungstenite::Message::Binary(msg)).await?;
        self.sink.send(tungstenite::Message::Binary(msg)).await?;

        return Ok(());
    }
}

pub struct Player {
    pub id: u8,
    pub position: (u16, u16),
    pub sink: PlayerSink,
    pub stream: PlayerStream,
}
