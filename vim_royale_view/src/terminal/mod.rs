use leptos::*;

use crate::state::{RenderState, PLAYER_TYPE};

#[component]
fn TerminalRelativeNu(cx: Scope) -> Element {
    let state = use_context::<&'static RenderState>(cx)
        .expect("consider what to do for SSR if we go that route");

    // TODO: Reactive updating of this via player position updates
    let els: Vec<Element> = (0..24)
        .map(|i: usize| {
            return view! {cx,
                <div class="terminal-column">
                    <div class="terminal-byte">
                        {move || {
                             if i == 12 {
                                return state.player_position.get().1.to_string();
                             }
                             return i.abs_diff(12).to_string();
                        }}
                    </div>
                </div>
            };
        })
        .collect();

    return view! {cx,
        <div class="terminal-relative-nu">
            {els}
        </div>
    };
}

fn get_class_from_state(player_position: usize, signal_idx: usize, signal: usize) -> &'static str {
    if player_position == signal_idx {
        return "terminal-byte player";
    }
    match signal {
        0 => return "terminal-byte off",
        1 => return "terminal-byte partial",
        2 => return "terminal-byte on",
        _ => return "terminal-byte off",
    }
}

#[component]
fn TerminalDisplay(cx: Scope) -> Element {
    let state = use_context::<&'static RenderState>(cx)
        .expect("consider what to do for SSR if we go that route");

    let mut els: Vec<Element> = vec![];

    for (idx, signal) in state.terminal_display.iter().enumerate() {
        els.push(view! {cx,
            <div class=move || get_class_from_state(
                RenderState::to_display(
                    state.player_position.get()), idx, signal.get())>
            </div>
        });
    }

    return view! {cx,
        <div class="terminal-display">
            {els}
        </div>
    };
}

#[component]
pub fn Terminal(cx: Scope) -> Element {
    return view! {cx,
        <div class="terminal">
            <TerminalRelativeNu />
            <TerminalDisplay />
        </div>
    };
}
