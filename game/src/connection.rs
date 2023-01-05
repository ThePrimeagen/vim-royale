use anyhow::Result;
use encoding::server::ServerMessage;
use tokio_tungstenite::tungstenite;

#[derive(clap::ValueEnum, Clone, Debug, Copy)]
pub enum SerializationType {
    JSON = 0,
    Deku = 1,
}

#[derive(Debug)]
pub enum ConnectionError {
    Data,
    Text,
    WebSocketError(tungstenite::Error),
}

#[derive(Debug)]
pub enum ConnectionMessage {
    Close(u8),
    ControlMessage,
    Msg(u8, ServerMessage),
    Error(u8, ConnectionError),
}
