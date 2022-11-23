FROM rust:latest AS FETCH_THE_EFFIN_RUST
WORKDIR /app
COPY Cargo.toml /app
COPY Cargo.lock /app
COPY vim_royale_client /app/vim_royale_client
COPY vim_royale_server /app/vim_royale_server
COPY encoding /app/encoding
COPY vim_royale /app/vim_royale
COPY game /app/game
COPY map /app/map
COPY vim_royale_view /app/vim_royale_view
RUN ls -la encoding
RUN rustup default nightly
RUN cargo fetch
RUN cd vim_royale_server
RUN pwd
RUN cargo build --release
RUN cargo install --path .
CMD ["sh", "-c", "/app/run"]

# FROM debian:latest
# EXPOSE 42069
# WORKDIR /app
# RUN apt update && apt install -y ca-certificates
# COPY --from=FETCH_THE_EFFIN_RUST /usr/local/cargo/bin/game_server /app
# COPY run /app/run
# ARG SERIAL
# CMD ["sh", "-c", "/app/run"]

