use leptos::*;

use crate::state::RenderState;

#[component]
pub fn Status(cx: Scope) -> Element {
    let state = use_context::<&'static RenderState>(cx).expect("There should always be a render state");

    return view! {cx,
        <div class="status">
            <div class="player-position">
                {move || format!("Player Position: {:?}", state.player_position.get())}
            </div>
        </div>
    };
}
