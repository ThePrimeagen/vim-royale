use encoding::server::ServerMessage;
use futures::channel::mpsc::Sender;
use vim_royale_view::{message::Msg, state::RenderState};
use crate::state::state::Reactor;

pub struct PlayerPosition { }

// TODO: What about the map integration (we will have f and t keys soon)
fn update_from_keystroke(state: &'static RenderState, key: &str) {
    let pos_update: (isize, isize) = match key {
        "j" => (0, 1),
        "k" => (0, -1),
        _ => return
    };

    state.player_position
        .update(|pos| {
            pos.0 = pos.0.saturating_add_signed(pos_update.0);
            pos.1 = pos.1.saturating_add_signed(pos_update.1);
        });
}

fn update_from_server_msg(state: &'static RenderState, msg: &ServerMessage) {
    let (x, y) = match &msg.msg {
        encoding::server::Message::PlayerPositionUpdate(p) => p.position,
        encoding::server::Message::PlayerStart(p) => p.position,
        _ => return,
    };

    let pos = (x as usize, y as usize);
    state.player_position.set(pos);
}

impl Reactor<RenderState, Msg, ServerMessage> for PlayerPosition {
    fn should(&self, msg: &Msg) -> bool {
        if msg.is_player_start() || msg.is_player_position_update() {
            return true;
        }

        match msg {
            Msg::KeyStroke(_) => return true,
            _ => return false,
        }
    }

    fn call(&mut self, state: &'static RenderState, msg: &Msg, _: Sender<ServerMessage>) {
        match msg {
            Msg::Message(msg) => {
                update_from_server_msg(state, msg);
            },

            Msg::KeyStroke(key) => {
                update_from_keystroke(state, key.as_str());
            },
            _ => return,
        };

    }
}
