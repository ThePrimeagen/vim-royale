import Fastify from "fastify"
import { renderToString } from "react-dom/server"
import { VimRoyale } from "./container"

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="style.css">
<link rel="preload" href="vim_royale_view_bg.wasm" as="fetch" type="application/wasm" crossorigin="">
<link rel="modulepreload" href="vim_royale_view.js">
</head>
<body>
__BODY__
<script type="module">import init from 'vim_royale_view.js';init('vim_royale_view_bg.wasm');</script>
</body>
</html>
`;

const fastify = Fastify({
  logger: false,
});

fastify.register(
  import('@fastify/compress'),
  { global: true }
).then(() => {
    fastify.get("/", function (request, reply) {
        const vimRoyale = renderToString(<VimRoyale />);
        reply.header("Content-Type", "text/html").send(
            // @ts-ignore
            HTML.replaceAll("__BODY__", vimRoyale));
    })

    fastify.listen({ host: "0.0.0.0", port: 3000 }, function (err, address) {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
    })
});

