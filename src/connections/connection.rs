use anyhow::{Context, Result};
use async_trait::async_trait;
use log::error;
use std::io::{self, Read, Write};

use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{
        tcp::{OwnedReadHalf, OwnedWriteHalf},
        TcpStream,
    },
    sync::mpsc,
    task::JoinHandle,
};

use crate::messages::server::ServerMessage;

#[derive(clap::ValueEnum, Clone, Debug)]
pub enum SerializationType {
    JSON = 0,
    Deku = 1,
}

pub type GameToPlayer = mpsc::Sender<ServerMessage>;
pub type PlayerToGame = mpsc::Sender<ConnectionMessage>;

type GameToPlayerReceiver = mpsc::Receiver<ServerMessage>;
type PlayerToGameReceiver = mpsc::Receiver<ConnectionMessage>;

pub enum ConnectionMessage {
    Msg(ServerMessage, usize),
    Error(usize),
    Close(usize),
}

#[async_trait]
pub trait Connection {
    fn game_to_player(&self) -> GameToPlayer;
    fn player_to_game(&mut self) -> Option<PlayerToGameReceiver>;
    fn id(&self) -> usize;
    async fn write_data(&mut self, data: &[u8]) -> Result<usize>;
}

pub struct TcpConnection {
    gtp_rx: GameToPlayerReceiver,
    gtp_tx: GameToPlayer,
    ptg_rx: Option<PlayerToGameReceiver>,
    ptg_tx: PlayerToGame,
    ident: usize,
    serializion_type: SerializationType,
    join_handles: Vec<JoinHandle<()>>,
    pub write: OwnedWriteHalf,
}

#[async_trait]
impl Connection for TcpConnection {
    fn game_to_player(&self) -> GameToPlayer {
        return self.gtp_tx.clone();
    }

    fn player_to_game(&mut self) -> Option<PlayerToGameReceiver> {
        return self.ptg_rx.take();
    }

    fn id(&self) -> usize {
        return self.ident;
    }

    async fn write_data(&mut self, data: &[u8]) -> Result<usize> {
        return self
            .write
            .write(data)
            .await
            .context("writing data to player");
    }
}

struct ParseData<'a> {
    pub data: &'a [u8],
    pub offset: usize,
    pub data_len: usize,
    pub data_type: SerializationType,
}

impl<'a> ParseData<'a> {
    pub fn new(data: &'a [u8], data_type: SerializationType) -> ParseData {
        return ParseData {
            data,
            offset: 0,
            data_len: 0,
            data_type,
        };
    }

    pub fn parse(&mut self) -> Option<ServerMessage> {
        let len = self.data[self.offset] as usize;
        self.offset = self.offset + 1;

        if self.offset + len > self.data_len {
            return None;
        }

        if let SerializationType::JSON = self.data_type {
            todo!("FINISH THIS BECAUSE I NEED TO SET THE OFFSET");
            match serde_json::from_slice(&self.data[self.offset..self.offset + len]) {
                Ok(server_msg) => {
                    return Some(server_msg);
                }
                Err(_) => {
                    todo!("???? How to handle this?");
                }
            }
        } else {
            println!(
                "data_length: {} -- offset {} -- len {}, total: {}",
                self.data_len,
                self.offset,
                len,
                self.offset + len
            );
            for i in 0..len + 1 {
                print!("{:#x} ", self.data[self.offset + i - 1]);
            }
            println!();

            match ServerMessage::deserialize(&self.data[self.offset..self.offset + len]) {
                Ok(server_msg) => {
                    self.offset = self.offset + len;
                    return Some(server_msg);
                }
                Err(e) => {
                    todo!("this can happen but i don't know how it can...: {}", e);
                }
            }
        }
    }

    pub fn reset(&mut self, offset: usize, data_length: usize) {
        self.offset = offset;
        self.data_len = data_length;
    }
}

async fn process_datas(
    data: &mut [u8],
    mut offset: usize,
    len: usize,
    ident: usize,
    tx: PlayerToGame,
    ser: &SerializationType,
) -> Result<usize> {
    /*
    while let Some((msg, o)) = process_data(&data, offset, len, ser) {
        offset = o;
        tx.send(ConnectionMessage::Msg(msg, ident)).await.ok();
    }

    if offset < len {
        print!("COPY WITHIN: ");
        for i in 0..(len - offset) {
            print!("{:#x} ", data[offset + i]);
        }
        println!();
        data.copy_within(offset..len, 0);
        offset = len - offset;
    }

    return Ok(offset);
    */
    todo!("Fix me daddy");
}

type ScratchBuf = [u8; 32];
async fn handle_incoming_messages(
    ident: usize,
    mut read: OwnedReadHalf,
    tx: PlayerToGame,
    ser: SerializationType,
) {
    let mut data: ScratchBuf = [0; 32];
    let mut offset = 0;

    loop {
        let res = read.read(&mut data[offset..]).await;
        offset = 0;

        if let Ok(bytes) = res {
            if bytes == 0 {
                tx.send(ConnectionMessage::Close(ident)).await.ok();
            }

            match process_datas(&mut data, offset, bytes, ident, tx.clone(), &ser).await {
                Ok(o) => {
                    offset = o;
                }
                Err(_) => {
                    tx.send(ConnectionMessage::Error(ident)).await.ok();
                }
            }
        } else if let Err(e) = res {
            if e.kind() != io::ErrorKind::WouldBlock {
                tx.send(ConnectionMessage::Error(ident)).await.ok();
            }
        }
    }
}

impl TcpConnection {
    pub fn new(ident: usize, stream: TcpStream, ser: SerializationType) -> TcpConnection {
        let (gtp_tx, gtp_rx) = mpsc::channel(10);
        let (ptg_tx, ptg_rx) = mpsc::channel(10);

        let (read, write) = stream.into_split();

        let receive_handle = tokio::spawn(handle_incoming_messages(
            ident,
            read,
            ptg_tx.clone(),
            ser.clone(),
        ));

        return TcpConnection {
            gtp_tx,
            gtp_rx,
            ptg_tx,
            serializion_type: ser,
            ptg_rx: Some(ptg_rx),
            ident,
            write,
            join_handles: vec![receive_handle],
        };
    }
}

#[cfg(test)]
mod test {
    use anyhow::Result;

    use crate::{
        connections::connection::{ParseData, SerializationType},
        messages::server::{CircleStart, Message, ServerMessage},
    };

    #[test]
    fn process_data_spec() -> Result<()> {
        let msg = ServerMessage {
            msg: Message::Whoami(0x45),
            seq_nu: 420,
            version: 69,
        };

        let mut encoded = msg.clone().serialize()?;
        let mut send: Vec<u8> = vec![];

        send.push(encoded.len() as u8);
        send.append(&mut encoded);

        let mut parser = ParseData::new(send.as_slice(), SerializationType::Deku);
        parser.reset(0, send.len());

        let out = parser.parse();
        assert_eq!(out, Some(msg.clone()));

        let mut junk = vec![];
        junk.push(69);
        junk.append(&mut send);

        let mut parser = ParseData::new(junk.as_slice(), SerializationType::Deku);
        parser.reset(0, junk.len());

        let out = parser.parse();
        assert_eq!(out, None);

        let out = parser.parse();
        assert_eq!(out, Some(msg.clone()));

        return Ok(());
    }

    fn process_datas_spec() -> Result<()> {
        /*
        let whoami_msg = ServerMessage {
            msg: Message::Whoami(0x45),
            seq_nu: 420,
            version: 69,
        };
        let circle_msg = ServerMessage {
            msg: Message::CircleStart(CircleStart { seconds: 69 }),
            seq_nu: 420,
            version: 69,
        };

        let mut whoami = whoami_msg.clone().serialize()?;
        let mut circle = circle_msg.clone().serialize()?;

        let mut send: Vec<u8> = vec![];

        send.push(whoami.len() as u8);
        send.append(&mut whoami);
        send.push(circle.len() as u8);
        send.append(&mut circle);

        let out = process_datas(send.as_slice(), 0);
        assert_eq!(out, Some((msg.clone(), send.len(),)));

        */

        return Ok(());
    }
}
