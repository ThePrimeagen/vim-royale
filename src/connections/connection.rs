use anyhow::{Context, Result};
use async_trait::async_trait;

use std::io::ErrorKind;
use tokio::io::{BufReader, AsyncRead};

use tokio::{
    io::{AsyncReadExt},
    net::{
        tcp::{OwnedReadHalf},
    }
};

use crate::messages::server::ServerMessage;

#[derive(clap::ValueEnum, Clone, Debug)]
pub enum SerializationType {
    JSON = 0,
    Deku = 1,
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
        return serde_json::from_slice(&vec).context("error while decoding json");
    }

    return ServerMessage::deserialize(&vec);
}

pub async fn handle_incoming_messages(
    _ident: usize,
    read: OwnedReadHalf,
    ser: SerializationType,
) {

    let mut read = BufReader::new(read);

    loop {
        let msg = match next_message(&mut read).await {
            Err(e) if e.kind() == ErrorKind::UnexpectedEof => {
                break;
            }
            Err(e) => {
                todo!("handle this erorr? {}", e);
            }
            Ok(msg) => msg,
        };

        let _msg = match deserialize(msg, &ser) {
            Err(_e) => {
                todo!("handle deserialize error");
            }
            Ok(msg) => msg,
        };
    }
}






