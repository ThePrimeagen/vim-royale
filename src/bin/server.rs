use anyhow::Result;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{extract::Extension, routing::get, Router};
use clap::Parser;
use serde::Deserialize;
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use tokio::net::TcpStream;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, RwLock};
use uuid::Uuid;
use vim_royale::args::ServerArgs;
use log::{warn, error};

struct ServerInfo {
    player_count: u8,
    game_count: usize,
}

struct ServerState {
    args: ServerArgs,
    servers: HashMap<String, ServerInfo>
}

type State = Arc<RwLock<ServerState>>;
const VERSION: usize = 69;

async fn read_server_updates(server: String, mut stream: TcpStream, state: State) {
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let args = ServerArgs::parse();
    warn!("starting server with: {:?}", args);
    let servers = args.servers.clone();
    let shared_state = Arc::new(RwLock::new(ServerState {
        servers: HashMap::new(),
        args,
    }));


    for server in &servers {
        match TcpStream::connect(server).await {
            Ok(stream) => {
                let info = ServerInfo {
                    player_count: 0,
                    game_count: 0,
                };

                read_server_updates(server.to_string(), stream, shared_state.clone());
            },
            Err(e) => {
                error!("received an error establishing the tcp connection to {} {}", server, e);
            }
        }
    }

    let app = Router::new()
        .route("/join", get(handler))
        .layer(Extension(shared_state));

    // run our app with hyper
    // `axum::Server` is a re-export of `hyper::Server`
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    return Ok(());
}

/// See the tests below for which combinations of `foo` and `bar` result in
/// which deserializations.
///
/// This example only shows one possible way to do this. [`serde_with`] provides
/// another way. Use which ever method works best for you.
///
/// [`serde_with`]: https://docs.rs/serde_with/1.11.0/serde_with/rust/string_empty_as_none/index.html
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct JoinParams {
    version: Option<usize>,
    uuid: Option<Uuid>,
}

async fn find_server(state: State) -> String {
    return String::from("");
}

async fn handler(
    Query(params): Query<JoinParams>,
    Extension(state): Extension<State>,
) -> Result<String, AppError> {
    if let Some(v) = params.version {
        if v != VERSION {
            return Err(anyhow::anyhow!("version out of date -- please update").into());
        }
    } else {
        return Err(anyhow::anyhow!("please provide a version").into());
    }
    if let None = params.uuid {
        return Err(anyhow::anyhow!("please provide a uuid").into());
    }

    let server = find_server(state.clone());

    return Ok(format!("count is {:?}", params));
}

// Make our own error that wraps `anyhow::Error`.
struct AppError(anyhow::Error);

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error: {}", self.0),
        )
            .into_response()
    }
}

// This enables using `?` on functions that return `Result<_, anyhow::Error>` to turn them into
// `Result<_, AppError>`. That way you don't need to do that manually.
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
