use tokio::sync::mpsc;

use crate::player::{PlayerWebSink, PlayerWebStream};

#[derive(Debug)]
pub enum GameMessage {
    Start,
    Connection(PlayerWebStream, PlayerWebSink),
    Close(usize),
}

pub type GameSender = mpsc::Sender<GameMessage>;
pub type GameReceiver = mpsc::Receiver<GameMessage>;

pub struct GameComms {
    pub sender: GameSender,
    pub receiver: GameReceiver,
}

impl GameComms {
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::channel(10);
        return Self { sender, receiver };
    }

    pub fn with_sender(sender: GameSender) -> (Self, GameSender) {
        let (sender_receiver, receiver) = mpsc::channel(10);
        return (Self { sender, receiver }, sender_receiver);
    }

    pub fn link(&self, other: &mut GameComms) {
        other.sender = self.sender.clone();
    }
}
