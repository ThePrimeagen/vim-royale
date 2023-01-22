use encoding::server::ServerMessage;
use futures::channel::mpsc::Sender;
use vim_royale_view::{message::Msg, state::RenderState};

use crate::state::state::Reactor;

pub struct DebugMessages { }

impl Reactor<RenderState, Msg, ServerMessage> for DebugMessages {
    fn should(&self, _msg: &Msg) -> bool {
        return true;
    }

    fn call(&mut self, _state: &'static RenderState, msg: &Msg, _: Sender<ServerMessage>) {
        leptos::log!("{:?}", msg);
    }
}

