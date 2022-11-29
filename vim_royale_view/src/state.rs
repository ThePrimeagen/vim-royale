use array_macro::array;
use leptos::*;
use map::window::Window;

use crate::{message::Msg, utils::screen::Screen};

pub const COLS: usize = 80;
pub const ROWS: usize = 24;
pub const TOTAL: usize = COLS * ROWS;

pub const COLS_RELATIVE: usize = 3;
pub const TOTAL_RELATIVE: usize = COLS_RELATIVE * ROWS;

#[derive(Clone)]
pub struct RenderState
{
    pub state: ReadSignal<Msg>,
    pub terminal_display: [RwSignal<usize>; TOTAL],
    pub terminal_lines: [RwSignal<usize>; TOTAL_RELATIVE],
}

impl RenderState
{
    pub fn new(read: ReadSignal<Msg>, cx: Scope) -> Self {
        let terminal_display: [RwSignal<usize>; TOTAL] =
            array![create_rw_signal(cx, usize::default()); TOTAL];

        let terminal_lines: [RwSignal<usize>; TOTAL_RELATIVE] =
            array![create_rw_signal(cx, usize::default()); TOTAL_RELATIVE];

        return RenderState {
            state: read,
            terminal_display,
            terminal_lines,
        };
    }
}

pub struct AppState
{
    screen: Screen,
}

impl AppState
{
    pub fn new() -> Self {
        return AppState {
            screen: Screen::new(),
        };
    }

    pub fn update_state(&mut self, cx: Scope, msg: Msg) {
        leptos::log!("app_state#update_state");
        match msg {
            Msg::Closed => todo!(),
            Msg::Connecting => {
                leptos::log!("app_state#update_state#connecting");
                let window: Window<10, 10> = Window::new();
                self.screen.draw(&window, None);

                let state = use_context::<&'static RenderState>(cx)
                    .expect("consider what to do for SSR if we go that route");
                self.screen.render(state);

            }
            Msg::Connected => todo!(),
            Msg::Error(_) => todo!(),
            Msg::Message(_) => todo!(),
        }
    }
}
