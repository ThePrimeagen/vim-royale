use encoding::server::{ServerMessage, self};

#[derive(Debug, Clone)]
pub enum Msg {
    Closed,
    Connecting,
    Connected,
    Error(String),
    Message(ServerMessage),
    KeyStroke(String),
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

    pub fn is_player_start(&self) -> bool {
        if let Msg::Message(msg) = self {
            if let server::Message::PlayerStart(_) = &msg.msg {
                return true;
            }
        }
        return false;
    }

    pub fn is_player_position_update(&self) -> bool {
        if let Msg::Message(msg) = self {
            if let server::Message::PlayerPositionUpdate(_) = &msg.msg {
                return true;
            }
        }
        return false;
    }
}
