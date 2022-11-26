use leptos::*;

use crate::state::AppState;

#[component]
fn TerminalRelativeNu(cx: Scope) -> Element {
    let els: Vec<Element> = (0..24).map(|_| {
        return view! {cx,
            <div class="terminal-column">
            {(0..3).map(|_| view! {cx, <div class="terminal-byte"> </div>}).collect::<Vec<Element>>()}
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
        _ => return String::from("terminal-byte on"),
    }
}

#[component]
fn TerminalDisplay(cx: Scope) -> Element {
    leptos::log!("setting state");
    let state =
        use_context::<&'static AppState>(cx).expect("consider what to do for SSR if we go that route");

    let mut els: Vec<Element> = vec![];

    for row in &state.terminal_display {
        for signal in row {
            let signal = signal.clone();
            els.push(view! {cx,
                <div
                    class:off={move || signal.get() == 0}
                    class:partial={move || signal.get() == 1}
                    class:on={move || signal.get() == 2}
                    class="terminal-byte"
                >
                </div>
            });
        }
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
