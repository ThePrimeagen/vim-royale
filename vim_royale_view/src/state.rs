use leptos::*;
use map::window::Window;

use crate::{message::Msg, utils::screen::Screen};

pub const COLS: usize = 80;
pub const ROWS: usize = 24;
pub const TOTAL: usize = COLS * ROWS;

pub const COLS_RELATIVE: usize = 3;
pub const TOTAL_RELATIVE: usize = COLS_RELATIVE * ROWS;

#[derive(Clone)]
pub struct RenderState {
    pub state: ReadSignal<Msg>,
    pub terminal_display: [RwSignal<usize>; TOTAL],
    pub terminal_lines: [RwSignal<usize>; TOTAL_RELATIVE],
}

impl RenderState {
    pub fn new(read: ReadSignal<Msg>, cx: Scope) -> Self {
        let terminal_display = std::array::from_fn::<RwSignal<usize>, TOTAL, _>(|_| {
            create_rw_signal(cx, usize::default())
        });

        let terminal_lines = std::array::from_fn::<RwSignal<usize>, TOTAL_RELATIVE, _>(|_| {
            create_rw_signal(cx, usize::default())
        });

        return RenderState {
            state: read,
            terminal_display,
            terminal_lines,
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

    pub fn print<const R: usize, const C: usize>(window: &Window<R, C>) {
        for row in 0..R {
            leptos::log!(
                "{}",
                window.data[row]
                    .iter()
                    .map(|x| x.to_string())
                    .collect::<String>()
            );
        }
    }

    pub fn update_state(&mut self, cx: Scope, msg: Msg) {
        leptos::log!("app_state#update_state");
        match msg {
            Msg::Closed => todo!(),
            Msg::Connecting => {
                leptos::log!("app_state#update_state#connecting");
                let mut window: Window<10, 10> = Window::new();
                window.outline(1);

                self.screen.draw(&window, None);

                AppState::print(&window);
                AppState::print(&self.screen.map);

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
