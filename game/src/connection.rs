use anyhow::Result;
use encoding::server::ServerMessage;
use tokio_tungstenite::tungstenite;

#[derive(clap::ValueEnum, Clone, Debug, Copy)]
pub enum SerializationType {
    JSON = 0,
    Deku = 1,
}

pub enum ConnectionError {
    Data,
    Text,
    WebSocketError(tungstenite::Error),
}

pub enum ConnectionMessage {
    Close(u8),
    ControlMessage,
    Msg((u8, Result<ServerMessage, anyhow::Error>)),
    Error((u8, ConnectionError)),
}
