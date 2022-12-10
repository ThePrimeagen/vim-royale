use actix_web::{get, web, App, HttpServer, Responder, middleware};
use leptos::*;
use vim_royale_view::container::{VimRoyale, VimRoyaleProps};

const HTML: &'static str = r#"
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="__STYLE_SHEET__">
<link rel="preload" href="__WASM__" as="fetch" type="application/wasm" crossorigin="">
<link rel="modulepreload" href="__JS__">
</head>
<body>
__BODY__
<script type="module">import init from '__JS__';init('__WASM__');</script>
</body>
</html>
"#;

#[derive(Clone, Debug)]
struct AppState {
    html: String,
}

#[get("/")]
async fn greet(data: web::Data<AppState>) -> impl Responder {
    let runtime = create_runtime();
    let html = run_scope(runtime, |cx| {
        return view! {cx,
            <VimRoyale />
        };
    });

    // HTML IS A STRING, RUST ANALYZER ISN'T APPLYING THE SSR CRAP
    return data.html.replace("__BODY__", &html);
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    let state = AppState {
        html: HTML.replace("__STYLE_SHEET__", "style.css")
            .replace("__WASM__", "vim_royale_view_bg.wasm")
            .replace("__JS__", "vim_royale_view.js")
            /*
            .lines()
            .collect::<String>(),
            */
    };

    HttpServer::new(move || {
        let state = state.clone();
        App::new()
            .wrap(middleware::Compress::default())
            .app_data(web::Data::new(state))
            .service(greet)
    })
    .bind(("0.0.0.0", 42069))?
    .run()
    .await
}

