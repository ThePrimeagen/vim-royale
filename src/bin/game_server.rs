use anyhow::Result;
use log::warn;
use tokio::net::TcpListener;
use clap::Parser;
use vim_royale::connections::connection::{handle_incoming_messages, SerializationType};

#[derive(Parser, Debug)]
#[clap()]
struct Args {

    #[clap(short = 'p', long = "port", default_value_t = 42001)]
    port: u16,

    #[clap(short = 's', long = "serialization", value_enum, default_value_t = SerializationType::Deku)]
    serialization: SerializationType,
}

// #[tokio::main(flavor = "current_thread")]
#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let server = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;

    warn!("starting the server on {}", args.port);
    let mut player_id = 0;

    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                player_id += 1;
                let (read, _) = stream.into_split();
                tokio::spawn(handle_incoming_messages(player_id, read, args.serialization.clone()));
            },

            Err(e) => {
                println!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}

