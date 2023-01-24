# Pin to specific hash since this image is controled by some rando
FROM lukemathwalker/cargo-chef@sha256:2d30138eea6c5985bb907659834e428e3a1cb3d3db5c26377d2346eeadbeca84 AS chef
RUN rustup default nightly
WORKDIR /app

# Create the recipe.json containing project structure + cargo files
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json


FROM chef AS builder 
# Build dependencies - this is the caching Docker layer!
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Build application
COPY . .
WORKDIR /app/vim_royale_server
RUN cargo build --release

# Build deployable image
FROM debian:buster-slim AS runtime
EXPOSE 42069
WORKDIR /app
RUN apt update && apt install -y ca-certificates
COPY --from=builder /app/target/release/vim_royale_server /app
CMD ["sh", "-c", "RUST_LOG=info /app/vim_royale_server"]
