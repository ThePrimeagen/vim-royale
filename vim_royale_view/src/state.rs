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

