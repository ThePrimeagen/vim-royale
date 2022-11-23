use encoding::server::ServerMessage;

#[derive(Debug, Clone)]
pub enum Msg {
    Closed,
    Connecting,
    Connected,
    Error(String),
    Message(ServerMessage),
}

