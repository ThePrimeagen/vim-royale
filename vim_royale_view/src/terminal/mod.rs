use leptos::*;

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

#[component]
fn TerminalDisplay(cx: Scope) -> Element {
    let els: Vec<Element> = (0..24).map(|_| {
        return view! {cx,
            <div class="terminal-column">
            {(0..80).map(|_| view! {cx, <div class="terminal-byte"> </div>}).collect::<Vec<Element>>()}
            </div>
        };
    }).collect();

    return view! {cx,
        <div class="terminal-display">
            {els}
        </div>
    };
}

#[component]
pub fn Terminal(cx: Scope) -> Element {
    gloo::console::log!("rendering terminal");
    return view! {cx,
        <div class="terminal">
            <TerminalRelativeNu />
            <TerminalDisplay />
        </div>
    };
}


