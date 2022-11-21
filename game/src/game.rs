use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU8, Ordering},
        Arc,
    },
};

use crate::{
    board::Map,
    connection::{ConnectionMessage, SerializationType},
    game_comms::{GameComms, GameMessage},
    player::{Player, PlayerSink, PlayerStream, PlayerWebSink, PlayerWebStream},
};
use anyhow::Result;
use encoding::{
    server::{self, ServerMessage, WHO_AM_I_CLIENT, WHO_AM_I_SERVER},
    version::VERSION,
};
use futures::{
    sink,
    stream::{SplitSink, SplitStream},
    Sink, SinkExt, Stream, StreamExt,
};
use log::{error, info, warn};
use tokio::{
    net::TcpStream,
    sync::mpsc::{Receiver, Sender},
};
use tokio_tungstenite::{tungstenite, WebSocketStream};

const FPS: u128 = 16_666;
const ENTITY_RANGE: usize = 500;

struct Game {
    seed: u32,
    map: Map,
    players: Vec<Option<Player>>,
    player_count: Arc<AtomicU8>,
    game_id: u32,
}

impl Game {
    pub fn new(seed: u32, game_id: u32, player_count: Arc<AtomicU8>) -> Game {
        let players = Vec::from_iter((0..100).map(|_| None));
        return Game {
            map: Map::new(seed),
            player_count,
            players,
            game_id,
            seed,
        };
    }

    async fn process_message(&mut self, msg: ServerMessage) {
        match msg.msg {
            server::Message::Whoami(whoami) => {
                if whoami == WHO_AM_I_CLIENT {
                    warn!("[CLIENT]: Whoami received");
                }
            }
            _ => {}
        }
    }

    async fn run(&mut self) -> Result<()> {
        let start = std::time::Instant::now();
        let start_of_loop = start.elapsed().as_micros();
        let mut loop_count = 0;

        loop {
            if loop_count % 1000 == 0 {
                info!(
                    "[GAME]: time={} loop={} {}",
                    loop_count,
                    start.elapsed().as_micros(),
                    self.info_string()
                );
            }

            loop_count += 1;
            let current = start.elapsed().as_micros();
            let next_frame = loop_count * FPS;

            if current < next_frame {
                let duration = (next_frame - current) as u64;
                let duration = std::time::Duration::from_micros(duration);
                tokio::time::sleep(duration).await;
            }
        }

        return Ok(());
    }

    fn is_ready(&self) -> bool {
        let id = self.player_count.load(Ordering::Relaxed);
        info!("[Game] Ready check {} == {}", id, 1);
        return id == 1;
    }

    fn add_player(&mut self, stream: PlayerWebStream, sink: PlayerWebSink) {
        let player_id = self.player_count.fetch_add(1, Ordering::Relaxed);

        let player = Player {
            position: (256, 256),
            id: player_id,
            sink: PlayerSink::new(player_id, sink),
            stream: PlayerStream::new(player_id, stream),
        };

        self.players[player_id as usize] = Some(player);
    }

    fn create_player_start_msg(player: &Player, seed: u32) -> server::Message {
        return server::Message::PlayerStart(server::PlayerStart {
            entity_id: player.id as usize * ENTITY_RANGE,
            position: player.position,
            range: ENTITY_RANGE,
            seed,
        });
    }

    // TODO: this probably has to be more robust to not cause a panic
    async fn start_game(&mut self) -> Result<()> {
        let mut handles = vec![];
        for (idx, player) in self.players.iter_mut().enumerate() {
            if let Some(player) = player {
                let msg = Game::create_player_start_msg(player, self.seed);
                handles.push(player.sink.send(msg));
            }
        }

        let _ = futures::future::join_all(handles).await;

        return Ok(());
    }

    fn error(&self, msg: &str) {
        error!(
            "[GAME]: msg={} id={} player_count={} seed={}",
            msg,
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }

    fn warn(&self, msg: &str) {
        warn!(
            "[GAME]: msg={} id={} player_count={} seed={}",
            msg,
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }

    fn info_string(&self) -> String {
        return format!(
            "id={} player_count={} seed={}",
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }
}

pub async fn game_run(seed: u32, player_count: Arc<AtomicU8>, game_id: u32, mut comms: GameComms) {
    let mut game = Game::new(seed, game_id, player_count);

    loop {
        match comms.receiver.recv().await {
            Some(GameMessage::Connection(stream, sink)) => {
                info!(
                    "[Game#game_run] new player connection for game {}",
                    game.info_string()
                );
                game.add_player(stream, sink);
                if game.is_ready() {
                    break;
                }
            }

            Some(msg) => {
                game.error(&format!(
                    "Game comms channel gave a non connection message {:?}.",
                    msg
                ));
                unreachable!("this should never happen");
            }

            None => {
                game.error("Game comms channel closed");
                unreachable!("this should never happen");
            }
        }
    }

    match comms.sender.send(GameMessage::Start).await {
        Ok(_) => {
            game.warn("Game sent start");
        }
        Err(_) => {
            game.error("Game failed to send start");
            unreachable!("this should never happen in production.");
        }
    }

    match game.start_game().await {
        Ok(_) => {
            game.warn("started");
        }
        Err(e) => {
            game.error(&format!("faled to start: {:?}", e));
        }
    }

    match game.run().await {
        Ok(_) => {
            game.warn("finished successfully");
        }
        Err(e) => {
            game.warn(&format!("finished with error {}", e));
        }
    }
}
