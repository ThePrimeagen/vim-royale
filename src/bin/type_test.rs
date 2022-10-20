use log::error;
use clap::Parser;
use tokio::sync::Semaphore;
use std::{
    io::{Read, Write},
    net::TcpStream, time::Duration, sync::Arc,
};

use anyhow::Result;
use vim_royale::messages::server::{Message, ServerMessage};

#[derive(clap::ValueEnum, Clone, Debug)]
enum SerializationType {
    JSON = 0,
    Deku = 1,
}

#[derive(Parser, Debug)]
#[clap()]
struct Args {
    #[clap(short = 's', long = "serialization", value_enum, default_value_t = SerializationType::Deku)]
    ser: SerializationType,

    #[clap(short = 'c', long = "count", default_value_t = 1000)]
    count: usize,

    #[clap(short = 'q', long = "conn_count", default_value_t = 1000)]
    conn_count: usize,

    #[clap(short = 'l', long = "parallel", default_value_t = 100)]
    parallel: usize,

    #[clap(short = 'p', long = "port", default_value_t = 42000)]
    port: u16,
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let args = Args::parse();

    let stop_msg = ServerMessage {
        msg: Message::Whoami(0x45),
        seq_nu: 420,
        version: 69,
    };
    let stop_serialize = if let SerializationType::JSON = args.ser {
        serde_json::to_vec(&stop_msg)?
    } else {
        stop_msg.serialize()?
    };

    let stop_serialize: &'static Vec<u8> = Box::leak(Box::new(stop_serialize));
    let semaphore = Arc::new(Semaphore::new(args.parallel));

    for i in 0..args.count {
        if i < args.parallel {
            tokio::time::sleep(Duration::from_millis((i * 5) as u64)).await;
        }

        let permit = semaphore.clone().acquire_owned();
        tokio::spawn(async move {
            let mut stream = match TcpStream::connect(format!("0.0.0.0:{}", args.port)) {
                Ok(stream) => stream,
                Err(e) => {
                    error!("unable to connect to {} got error {}", format!("0.0.0.0:{}", args.port), e);
                    drop(permit);
                    return;
                }
            };

            for _ in 0..args.conn_count {
                match stream.write(&[stop_serialize.len() as u8]) {
                    Err(e) => {
                        error!("unable to write to stream {}", e);
                        drop(permit);
                        return;
                    },
                    _ => {}
                }

                match stream.write(&stop_serialize.as_slice()) {
                    Err(e) => {
                        error!("unable to write to stream {}", e);
                        drop(permit);
                        return;
                    },
                    _ => {}
                }
            }

            drop(permit);
        });
    }

    return Ok(());
}

