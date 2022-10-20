use tokio::{net::tcp::OwnedWriteHalf, sync::mpsc, task::JoinHandle};

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

/*
async fn process_data(data: &[u8]) {
    loop {
        if bytes == 0 {
            remaining_data = 0;
            break;
        }

        let len = remaining[0] as usize;
        if len > remaining.len() - 1 {
            remaining_data = remaining.len();

            // TODO: I am dumb, become less of that
            data.fill(0);

            for (idx, byte) in remaining.iter().enumerate() {
                data[idx] = *byte;
            }
            break;
        }

        match ServerMessage::deserialize(&remaining[1..]) {
            Ok(server_msg) => {
                remaining = &remaining[1 + len..];
                bytes -= len + 1;

                tx.send(server_msg).await;
            },
            Err(_) => {
                todo!("this can happen but i don't know how it can...");
            }
        }
    }
}

type ScratchBuf = [u8; 32];
async fn handle_incoming_messages(ident: usize, mut read: OwnedReadHalf) {
    let mut data: ScratchBuf = [0; 32];
    let mut remaining_data = 0;

    loop {
        let mut inner_data: ScratchBuf = if remaining_data > 0 {
            data.clone()
        } else {
            [0; 32]
        };

        let res = read.read(&mut inner_data[remaining_data..]).await;
        remaining_data = 0;

        if let Ok(mut bytes) = res {
            if bytes == 0 {
                todo!("Communicate that the read side is closed");
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

#[cfg(test)]
mod test {
}
*/
