FROM rust:latest AS FETCH_THE_EFFIN_RUST
RUN rustup default nightly

WORKDIR /app
COPY Cargo.toml /app
COPY Cargo.lock /app

COPY vim_royale_view/Cargo.toml /app/vim_royale_view/Cargo.toml
COPY vim_royale_server/Cargo.toml /app/vim_royale_server/Cargo.toml
COPY encoding/Cargo.toml /app/encoding/Cargo.toml
COPY vim_royale_client/Cargo.toml /app/vim_royale_client/Cargo.toml
COPY encoding/Cargo.toml /app/encoding/Cargo.toml
COPY vim_royale/Cargo.toml /app/vim_royale/Cargo.toml
COPY game/Cargo.toml /app/game/Cargo.toml
COPY map/Cargo.toml /app/map/Cargo.toml

COPY vim_royale/src/main.rs /app/vim_royale/src/main.rs
COPY vim_royale_view/src/lib.rs /app/vim_royale_view/src/lib.rs
COPY vim_royale_server/src/main.rs /app/vim_royale_server/src/main.rs
COPY encoding/src/lib.rs /app/encoding/src/lib.rs
COPY vim_royale_client/src/main.rs /app/vim_royale_client/src/main.rs
COPY encoding/src/lib.rs /app/encoding/src/lib.rs
COPY vim_royale/src/lib.rs /app/vim_royale/src/lib.rs
COPY game/src/lib.rs /app/game/src/lib.rs
COPY map/src/lib.rs /app/map/src/lib.rs

run cargo fetch

RUN pwd

COPY vim_royale_server /app/vim_royale_server
COPY vim_royale_client /app/vim_royale_client
COPY vim_royale_view /app/vim_royale_view
COPY vim_royale /app/vim_royale

COPY encoding /app/encoding
COPY map /app/map
COPY game /app/game

WORKDIR /app/vim_royale_server
RUN pwd
RUN cargo build --release

FROM debian:latest
EXPOSE 42069
WORKDIR /app
RUN apt update && apt install -y ca-certificates
COPY --from=FETCH_THE_EFFIN_RUST /app/target/release/vim_royale_server /app
CMD ["sh", "-c", "RUST_LOG=info /app/vim_royale_server"]

