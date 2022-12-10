use encoding::server::ServerMessage;

#[derive(Debug, Clone)]
pub enum Msg {
    Closed,
    Connecting,
    Connected,
    Error(String),
    Message(ServerMessage),
    KeyStroke(u64),
}

impl Msg {
    pub fn key_from_msg(msg: &Msg) -> &'static str {
        return match msg {
            Msg::Closed => "closed",
            Msg::Connecting => "connecting",
            Msg::Connected => "connected",
            Msg::Error(_) => "error",
            Msg::KeyStroke(_) => "key_stroke",
            Msg::Message(_) => "message",
        };
    }
}
