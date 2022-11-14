use clap::Parser;
use log::error;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;
use std::{sync::Arc, time::Duration};
use tokio::sync::Semaphore;
use futures::{StreamExt, SinkExt};

use anyhow::Result;
use vim_royale::messages::server::{ServerMessage, self};

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

    #[clap(short = 'r', long = "runs", default_value_t = 50)]
    runs: usize,

    #[clap(short = 'l', long = "parallel", default_value_t = 100)]
    parallel: usize,

    #[clap(short = 'p', long = "port", default_value_t = 42001)]
    port: u16,

    #[clap(short = 'a', long = "addr", default_value_t = String::from("0.0.0.0"))]
    addr: String,
}

async fn run(args: &'static Args, stop_serialize: &'static Vec<u8>, addr: &'static str) -> Result<()> {
    let semaphore = Arc::new(Semaphore::new(args.parallel));
    let mut handles = vec![];

    for i in 0..args.count {
        if i < args.parallel {
            tokio::time::sleep(Duration::from_millis(5 as u64)).await;
        }

        let permit = semaphore.clone().acquire_owned().await;
        handles.push(tokio::spawn(async move {
            let (stream, _) = match connect_async(format!("ws://{}", addr)).await {
                Ok(stream) => stream,
                Err(e) => {
                    error!("unable to connect to {} got error {}", addr, e);
                    drop(permit);
                    return;
                }
            };

            let (mut write, mut read) = stream.split();

            let msg = Message::Binary(stop_serialize.clone());
            for _ in 0..args.conn_count {
                match write.send(msg.clone()).await {
                    Err(e) => {
                        error!("unable to write to stream {}", e);
                        drop(permit);
                        return;
                    }
                    _ => {}
                }

                let _ = read.next().await;
            }

            write.close().await;
            drop(permit);
        }));
    }

    futures::future::join_all(handles).await;
    return Ok(());
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let args: &'static Args = Box::leak(Box::new(Args::parse()));
    let stop_msg = ServerMessage {
        msg: server::Message::Whoami(0x45),
        seq_nu: 420,
        version: 69,
    };
    let stop_serialize = if let SerializationType::JSON = args.ser {
        serde_json::to_vec(&stop_msg)?
    } else {
        stop_msg.serialize()?
    };

    let addr: &'static str = Box::leak(Box::new(format!("{}:{}", &args.addr, args.port)));
    let stop_serialize: &'static Vec<u8> = Box::leak(Box::new(stop_serialize));

    for _ in 0..args.runs {
        let now = tokio::time::Instant::now();
        run(args, stop_serialize, addr).await?;
        println!("{}", now.elapsed().as_millis());
    }

    return Ok(());
}