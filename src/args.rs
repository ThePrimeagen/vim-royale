use clap::Parser;

#[derive(Parser, Debug)]
#[clap()]
pub struct ServerArgs {
    #[clap(long = "players", short = 'p', default_value_t = 100)]
    pub players_per_game: usize,

    #[clap(long = "servers")]
    pub servers: Vec<String>,
}
