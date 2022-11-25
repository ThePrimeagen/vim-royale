use leptos::*;
use crate::status::{Status, StatusProps};
use crate::terminal::{Terminal, TerminalProps};

#[component]
pub fn Background(cx: Scope) -> Element {
    return view! {cx,
        <div>
            <img class="animu" alt="animu" src="https://raw.githubusercontent.com/ThePrimeagen/anime/master/oskr_the_primeagen_6371be34-bd8a-4643-82c1-d480ec36ea29.png"/>
            <div class="background center">
            </div>
        </div>
    }
}

#[component]
pub fn VimRoyale(cx: Scope) -> Element {
    /*
    let (r, w) = create_signal(cx, true);

    return view! {cx,
        <div class:connecting={move || r.get()}>
    */

    // TODO: State... saving?
    return view! {cx,
        <div class="tokyonight">
            <div>
                <Background />
            </div>

            <div class="center">
                <Status />
            </div>

            <div class="center">
                <Terminal />
            </div>

        </div>
    }
}
