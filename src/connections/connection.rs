use std::io::{Read, self};

use tokio::{net::{TcpStream, tcp::{OwnedWriteHalf, OwnedReadHalf}}, sync::mpsc, task::JoinHandle, io::AsyncReadExt};

use crate::messages::server::ServerMessage;

pub type GameToPlayer = mpsc::Sender<ServerMessage>;
pub type PlayerToGame = mpsc::Sender<ConnectionMessage>;

type GameToPlayerReceiver = mpsc::Receiver<ServerMessage>;
type PlayerToGameReceiver = mpsc::Receiver<ConnectionMessage>;

pub struct ConnectionMessage {
    msg: ServerMessage,
    from: usize,
}

pub trait Connection {
    fn game_to_player(&self) -> GameToPlayer;
    fn player_to_game(&mut self) -> Option<PlayerToGameReceiver>;
    fn id(&self) -> usize;
}

pub struct TcpConnection {
    gtp_rx: GameToPlayerReceiver,
    gtp_tx: GameToPlayer,
    ptg_rx: Option<PlayerToGameReceiver>,
    ptg_tx: PlayerToGame,
    ident: usize,
    join_handles: Vec<JoinHandle<()>>,
    write: OwnedWriteHalf,
}

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
}

async fn handle_incoming_messages(ident: usize, mut read: OwnedReadHalf) {
    let mut data: Vec<u8> = vec![0; 32];
    let mut offset = 0;

    loop {
        let res = read.read(&mut data[offset..]).await;
        if let Ok(mut bytes) = res {
            if bytes == 0 {
                todo!("Communicate that the read side is closed");
            }

            let mut remaining = data.as_slice();
            loop {
                if bytes == 0 {
                    offset = 0;
                    break;
                }

                let len = remaining[0] as usize;
                if len > remaining.len() - 1 {
                    todo!("store the rest for next time");
                }

                match ServerMessage::deserialize(&remaining[1..]) {
                    Ok(server_msg) => {
                        // TODO: server message
                        remaining = &remaining[1 + len..];
                        bytes -= len + 1;
                    },
                    Err(_) => {

                    }
                }
            }
        } else if let Err(e) = res {
            if e.kind() != io::ErrorKind::WouldBlock {
                todo!("Communicate that the read side is closed");
            }
        }
    }
}

impl TcpConnection {
    pub fn new(ident: usize, stream: TcpStream) -> TcpConnection {
        let (gtp_tx, gtp_rx) = mpsc::channel(10);
        let (ptg_tx, ptg_rx) = mpsc::channel(10);

        let (read, write) = stream.into_split();

        let receive_handle = tokio::spawn(handle_incoming_messages(ident, read));

        return TcpConnection {
            gtp_tx,
            gtp_rx,
            ptg_tx,
            ptg_rx: Some(ptg_rx),
            ident,
            write,
            join_handles: vec![receive_handle],
        }
    }
}
