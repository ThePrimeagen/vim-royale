use anyhow::{Context, Result};
use async_trait::async_trait;
use log::error;
use std::io::{self, Read, Write, ErrorKind};
use tokio::io::{BufReader, AsyncRead};

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

async fn next_message(read: &mut (dyn AsyncRead + Unpin + Send)) -> Result<Vec<u8>, std::io::Error> {
    let mut len_buf: [u8; 1] = [0; 1];
    read.read_exact(&mut len_buf).await?;

    let len = *len_buf.get(0).expect("expect a length to be there") as usize;

    let mut data_buf: Vec<u8> = vec![0u8; len];
    read.read_exact(&mut data_buf).await?;

    return Ok(data_buf);
}

fn deserialize(vec: Vec<u8>, ser: &SerializationType) -> Result<ServerMessage> {
    if let SerializationType::JSON = ser {
        todo!("json serialize");
    }

    return ServerMessage::deserialize(&vec);
}

type ScratchBuf = [u8; 32];
async fn handle_incoming_messages(
    ident: usize,
    mut read: OwnedReadHalf,
    tx: PlayerToGame,
    ser: SerializationType,
) {

    let mut read = BufReader::new(read);

    let mut count = 0;
    let now = tokio::time::Instant::now();
    loop {
        let msg = match next_message(&mut read).await {
            Err(e) if e.kind() == ErrorKind::UnexpectedEof => {
                break;
            }
            Err(e) => {
                todo!("handle this erorr?");
            }
            Ok(msg) => msg,
        };

        let msg = match deserialize(msg, &ser) {
            Err(e) => {
                todo!("handle deserialize error");
            }
            Ok(msg) => msg,
        };
        count += 1;
    }
    println!("time taken({}) {}", ident, now.elapsed().as_micros());
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










