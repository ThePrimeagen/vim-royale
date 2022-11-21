use anyhow::{Context, Result};
use encoding::server::{self, PlayerStart, ServerMessage};
use encoding::version::VERSION;
use futures::stream::{SplitSink, SplitStream};
use futures::{StreamExt, AsyncWrite, Sink, SinkExt, Stream};
use log::{error, warn};
use tokio::sync::mpsc::Sender;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{tungstenite, WebSocketStream};

use std::io::ErrorKind;
use tokio::io::{AsyncRead, BufReader, BufWriter};

use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::tcp::{OwnedReadHalf, OwnedWriteHalf},
};

#[derive(clap::ValueEnum, Clone, Debug)]
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
    Close,
    ControlMessage,
    Msg(ServerMessage),
    Error(ConnectionError),
}
