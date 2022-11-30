use leptos::*;

use crate::state::RenderState;

#[component]
fn TerminalRelativeNu(cx: Scope) -> Element {
    let state = use_context::<&'static RenderState>(cx)
        .expect("consider what to do for SSR if we go that route");


    let els: Vec<Element> = (0..24).map(|i: usize| {
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
    }).collect();

    return view! {cx,
        <div class="terminal-relative-nu">
            {els}
        </div>
    };
}

fn get_class_from_state(signal: RwSignal<usize>) -> String {
    let state = signal.get();

    match state {
        0 => return String::from("terminal-byte off"),
        1 => return String::from("terminal-byte partial"),
        2 => return String::from("terminal-byte on"),
        3 => return String::from("terminal-byte player"),
        _ => return String::from("terminal-byte off"),
    }
}

#[component]
fn TerminalDisplay(cx: Scope) -> Element
{
    let state = use_context::<&'static RenderState>(cx)
        .expect("consider what to do for SSR if we go that route");

    let mut els: Vec<Element> = vec![];

    for signal in &state.terminal_display {
        let signal = signal.clone();
        els.push(view! {cx,
            <div class=move || get_class_from_state(signal)>
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
