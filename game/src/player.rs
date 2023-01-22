use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{Context, Result};
use encoding::server::{self, Message, ServerMessage};
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};

use tokio::net::TcpStream;
use tokio_tungstenite::{tungstenite, WebSocketStream};

use crate::connection::{ConnectionError, ConnectionMessage, SerializationType};

pub type PlayerWebStream = SplitStream<WebSocketStream<TcpStream>>;
pub type PlayerWebSink = SplitSink<WebSocketStream<TcpStream>, tungstenite::Message>;

pub struct PlayerSink {
    pub id: u8,
    pub seq_nu: u16,
    pub sink: PlayerWebSink,
    pub ser_type: SerializationType,
}

fn deserialize(vec: Vec<u8>, ser: &SerializationType) -> Result<ServerMessage> {
    if let SerializationType::JSON = ser {
        return serde_json::from_slice(&vec).context("error while decoding json");
    }

    return ServerMessage::deserialize(&vec);
}

pub async fn next_player_msg(
    id: u8,
    stream: &mut PlayerWebStream,
    ser_type: SerializationType,
) -> Result<ConnectionMessage> {
    match stream.next().await {
        Some(Ok(tungstenite::Message::Binary(msg))) => {
            // TODO: I should probably change that...
            let msg = deserialize(msg, &ser_type).context("error while deserializing message")?;

            return Ok(ConnectionMessage::Msg(id, msg));
        }

        Some(Ok(tungstenite::Message::Text(_))) => {
            return Ok(ConnectionMessage::Error(id, ConnectionError::Text));
        }

        // control frames
        Some(Ok(_)) => {
            return Ok(ConnectionMessage::ControlMessage);
        }

        Some(Err(e)) => {
            return Ok(ConnectionMessage::Error(
                id,
                ConnectionError::WebSocketError(e),
            ));
        }

        None => {
            return Ok(ConnectionMessage::Close(id));
        }
    };
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

        let msg = if let SerializationType::JSON = self.ser_type {
            serde_json::to_vec(&msg).context("error while encoding json")?
        } else {
            msg.serialize().context("error while encoding deku")?
        };

        // TODO: Somehow i got into this situation where i don't know how to
        // write.  i really hate this trait thing.
        // PlayerSink.write(&mut self.sink, &msg).await;

        // self.sink.write_all(tungstenite::Message::Binary(msg)).await?;
        self.sink.send(tungstenite::Message::Binary(msg)).await?;

        return Ok(());
    }
}

pub async fn sync_clock(
    count: usize,
    stream: &mut PlayerWebStream,
    sink: &mut PlayerWebSink,
) -> Result<i64> {
    let mut clock_diffs: Vec<i64> = vec![];

    for _ in 0..count {
        let rtt = std::time::Instant::now();
        let then = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_micros() as i64;

        let msg = Message::clock_request();
        let msg = ServerMessage::new(0, msg).serialize()?;

        sink.send(tungstenite::Message::Binary(msg)).await?;
        let msg = loop {
            match stream.next().await {
                Some(Ok(tungstenite::Message::Binary(msg))) => {
                    break msg;
                }
                Some(Ok(tungstenite::Message::Ping(_))) => {}
                Some(Ok(tungstenite::Message::Pong(_))) => {}

                Some(Err(e)) => {
                    return Err(anyhow::anyhow!("error while syncing clock: {:?}", e));
                }

                _ => {
                    return Err(anyhow::anyhow!("error while syncing clock"));
                }
            }
        };

        let msg = ServerMessage::deserialize(&msg)?;
        let msg = match msg.msg {
            Message::ClockSyncResponse(resp) => resp,
            _ => {
                return Err(anyhow::anyhow!("error while syncing clock"));
            }
        };

        let rtt = rtt.elapsed().as_micros() as i64;
        let clock_diff = (then + rtt / 2) - msg.client_time * 1000;
        clock_diffs.push(clock_diff);
    }

    return Ok(clock_diffs.iter().sum::<i64>() / clock_diffs.len() as i64);
}
