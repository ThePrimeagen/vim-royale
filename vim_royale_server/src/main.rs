use actix_web::{Responder, HttpServer, App, HttpResponse};
use cfg_if::cfg_if;

cfg_if! {
if #[cfg(feature = "ssr")] {

use leptos::*;
use vim_royale_view::container::{VimRoyale, VimRoyaleProps};

#[component]
fn VimRoyaleApp(cx: Scope) -> Element {
    return view! {cx,
        <VimRoyale />
    };
}

async fn hello() -> impl Responder {
    let rendered = run_scope(create_runtime(), |cx| view! { cx, <VimRoyaleApp/> });
    return HttpResponse::Ok().body(rendered);
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

} else {
fn main() {
    unreachable!("this should never run, please make sure ssr is on");
}
}
}
