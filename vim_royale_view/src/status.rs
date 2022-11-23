use leptos::*;


#[component]
pub fn Status(cx: Scope) -> Element {
    /*
    let state = use_context::<State>(cx).unwrap();
    let msg = move || match state.read.get() {
        Msg::Closed => "Closed".into(),
        Msg::Connecting => "Connecting".into(),
        Msg::Connected => "Connected".into(),
        Msg::Error(_) => "Error".into(),
        Msg::Message(msg) => format!("Message {:?}", msg),
    };
    */

    return view! {cx,
        <div class="status">
            {"NOT HERE"}
        </div>
    }
}

