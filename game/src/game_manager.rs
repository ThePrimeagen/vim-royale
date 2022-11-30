use std::collections::HashMap;
use std::sync::{atomic::AtomicU8, Arc};

use log::info;
use tokio::task::JoinHandle;

use crate::connection::SerializationType;
use crate::game_comms::GameMessage;
use crate::{
    game::game_run,
    game_comms::{GameComms, GameSender},
    player::{PlayerWebSink, PlayerWebStream},
};

pub struct GameStub {
    pub player_count: Arc<AtomicU8>,
    pub sender: GameSender,
    pub comms: Option<GameComms>,
    started: bool,
    game_id: u32,
    handle: Option<JoinHandle<()>>,
    ser_type: SerializationType,
}

impl GameStub {
    fn new(sender: GameSender, id: u32, ser_type: SerializationType) -> Self {
        let (comms, sender) = GameComms::with_sender(sender);

        return Self {
            player_count: Arc::new(AtomicU8::new(0)),
            sender,
            ser_type,
            game_id: id,
            comms: Some(comms),
            handle: None,
            started: false,
        };
    }
}

pub struct GameConfig {
    ser_type: SerializationType,
    max_players: usize,
}

impl GameConfig {
    pub fn new(ser_type: SerializationType, max_players: usize) -> Self {
        return Self {
            ser_type,
            max_players,
        };
    }
}

pub struct GameManager {
    game_id: u32,
    games: HashMap<u32, GameStub>,
    comms: GameComms,
    ser_type: SerializationType,
}

impl GameManager {
    pub fn new(ser_type: SerializationType) -> GameManager {
        return GameManager {
            games: HashMap::new(),
            game_id: 0,
            comms: GameComms::new(),
            ser_type,
        };
    }

    fn start_game_stub(game_stub: &mut GameStub) {
        let comms = game_stub
            .comms
            .take()
            .expect("comms always exist at this point");

        let run = game_run(
            game_stub.game_id,
            game_stub.player_count.clone(),
            game_stub.game_id,
            comms,
            game_stub.ser_type.clone()
        );

        game_stub.handle = Some(tokio::spawn(run));
        game_stub.started = true;
    }

    pub async fn add_connection(&mut self, stream: PlayerWebStream, sink: PlayerWebSink) {
        let game_id = self.game_id;
        info!("[GIM] add connection at {}", game_id);
        let game = self.games.entry(game_id).or_insert_with(|| {
            info!("[GIM] creating new stub for {}", game_id);
            let mut stub = GameStub::new(self.comms.sender.clone(), game_id, self.ser_type.clone());
            GameManager::start_game_stub(&mut stub);

            return stub;
        });

        let conn_message = GameMessage::Connection(stream, sink);
        let player_count = game.player_count.load(std::sync::atomic::Ordering::Relaxed);
        // TODO: How to make this number configurable?
        if player_count >= 1 {
            self.game_id += 1;
            info!(
                "[GIM] game {} full, creating new stub for id={}",
                game_id,
                game_id + 1
            );
            let game_id = self.game_id;
            let mut stub = GameStub::new(self.comms.sender.clone(), game_id, self.ser_type.clone());
            GameManager::start_game_stub(&mut stub);

            info!("[GIM] sending connection message id={}", game_id);
            _ = stub.sender.send(conn_message).await;
            self.games.insert(game_id, stub);
        } else {
            info!("[GIM] connection message sent id={}", game_id);
            _ = game.sender.send(conn_message).await;
        }
    }

    pub fn get_all_game_status(&self) -> HashMap<usize, usize> {
        let mut game_status = HashMap::new();
        for (id, game) in self.games.iter() {
            game_status.insert(
                *id as usize,
                game.player_count.load(std::sync::atomic::Ordering::Relaxed) as usize,
            );
        }

        return game_status;
    }
}

/*
self.games(self.game_id).or_insert_with(|| {
    let mut stub = GameStub::new(self.comms.sender.clone());
    stub.handle = Some(tokio::spawn(game_run(
        self.game_id, // TODO: Seed generation
        stub.player_count.clone(),
        self.game_id,
        stub.comms.take().expect("comms should exist at this point"),
    )));
    self.games.insert(self.game_id, stub);
});
*/

/*
self.games

*/



























