use encoding::server::{ServerMessage, Message};
use leptos::*;

use crate::{message::Msg, utils::screen::Screen};

pub const COLS: usize = 80;
pub const ROWS: usize = 24;
pub const TOTAL: usize = COLS * ROWS;

#[derive(Clone)]
pub struct RenderState {
    pub state: ReadSignal<Msg>,
    pub terminal_display: [RwSignal<usize>; TOTAL],
    pub player_position: RwSignal<(usize, usize)>,
}

impl RenderState {
    pub fn new(read: ReadSignal<Msg>, cx: Scope) -> Self {
        let terminal_display = std::array::from_fn::<RwSignal<usize>, TOTAL, _>(|_| {
            create_rw_signal(cx, usize::default())
        });

        return RenderState {
            player_position: create_rw_signal(cx, (0, 0)),
            state: read,
            terminal_display,
        };
    }
}

pub struct AppState {
    screen: Screen,
}

impl AppState {
    pub fn new() -> Self {
        return AppState {
            screen: Screen::new(),
        };
    }

    pub fn update_state(&mut self, cx: Scope, msg: Msg) {
        leptos::log!("app_state#update_state");
        match msg {
            Msg::Closed => {
                leptos::log!("app_state#update_state#closed");
            }

            Msg::Connecting => {
                leptos::log!("app_state#update_state#connecting");
            }

            Msg::Connected => {
                leptos::log!("app_state#update_state#connected");
            }
,
            Msg::Error(e) => {
                leptos::log!("app_state#update_state#error: {}", e);
            }
,
            Msg::Message(msg) => {
                self.handle_message(cx, msg);
            }
        }
    }

    fn handle_message(&mut self, cx: Scope, msg: ServerMessage) {
        leptos::log!("app_state#handle_message: {:?}", msg);
        let state = use_context::<&'static RenderState>(cx).expect("There should always be a render state");

        match msg.msg {
            Message::PlayerStart(start) => {
                state.player_position.set((
                    start.position.0 as usize, start.position.1 as usize
                ));
            }

            _ => todo!("bang me daddy {:?}", msg),
        }
    }

}
