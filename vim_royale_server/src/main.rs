use actix_web::{get, web, App, HttpServer, Responder};
use leptos::*;
use vim_royale_view::container::{VimRoyale, VimRoyaleProps};

#[get("/hello/{name}")]

async fn greet(name: web::Path<String>) -> impl Responder {
    let runtime = create_runtime();
    let html = run_scope(runtime, |cx| {
        return view! {cx,
            <VimRoyale />
        };
    });

    return format!("Hello {}", html);
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(greet)
    })
    .bind(("0.0.0.0", 42069))?
    .run()
    .await
}

