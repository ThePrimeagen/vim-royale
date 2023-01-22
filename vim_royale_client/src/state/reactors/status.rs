use encoding::server::{ServerMessage, self, PlayerStart};
use futures::channel::mpsc::Sender;
use vim_royale_view::{message::Msg, state::RenderState};

use crate::state::state::Reactor;

pub struct Status { }

fn to_message(msg: &Msg) -> Option<&PlayerStart> {
    if let Msg::Message(msg) = msg {
        if let server::Message::PlayerStart(m) = &msg.msg {
            return Some(m);
        }
        return None;
    }
    return None;
}

impl Reactor<RenderState, Msg, ServerMessage> for Status {
    fn should(&self, msg: &Msg) -> bool {
        return msg.is_player_start();
    }

    fn call(&mut self, state: &'static RenderState, msg: &Msg, _: Sender<ServerMessage>) {
        let start = to_message(&msg).expect("should never pass 'should' if this doesn't exist");
        state.player_position.set((
            start.position.0 as usize, start.position.1 as usize
        ));
    }
}
