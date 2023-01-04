use std::{sync::{atomic::AtomicUsize, Arc}, collections::HashMap, str::FromStr};

use tokio::{sync::mpsc::{Receiver, Sender}, task::JoinHandle};
use crate::game_comms::{GameComms, GameInstanceMessage, GameSender};
use log::error;

struct Game {
    player_count: Arc<AtomicUsize>,
    comms: GameComms,
    game_id: usize,
}

struct GameStub {
    player_count: Arc<AtomicUsize>,
    tx: GameSender,
}

fn game_instance_manage(mut rx: Receiver<GameInstanceMessage>, tx: Sender<GameInstanceMessage>) {
    let (mut rx_game, tx_game) = tokio::sync::mpsc::channel::<GameInstanceMessage>(100);

    let mut current_game: Option<GameStub> = None;
    let mut game_id = 0;
    let mut running_games: HashMap<usize, GameStub> = HashMap::new();

    loop {
        let msg = tokio::select! {
            msg = rx.recv() => {
                if msg.is_none() {
                    error!("game instance manager channel has been closed.  Closing down server.");
                    break;
                }

                msg
            }
            msg = rx_game.recv() => { msg }
        };

        let msg = match msg {
            Some(msg) => msg,
            None => {
                continue;
            }
        }

        match msg {
            GameInstanceMessage::Connection(stream, sink) => {
            },
            GameInstanceMessage::StartGame(_) => todo!(),
            GameInstanceMessage::EndGame(_) => todo!(),
        }
    }
}

type GameInstanceInfo = (Sender<GameInstanceMessage, JoinHandle<()>);
pub async fn game_instance_manager_spawn(mut rx: Receiver<GameInstanceMessage>, tx: Sender<GameInstanceMessage>) -> GameInstanceInfo {
    let (rx, tx) = tokio::sync::mpsc::channel(100);

    let handle = tokio::spawn(game_instance_manage(rx, tx.clone()));
    return (tx, handle);
}


