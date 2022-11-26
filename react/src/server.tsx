import Fastify from "fastify"
import { renderToString } from "react-dom/server"
import { VimRoyale } from "./container"

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="root">
__BODY__
</div>
<script src="client.js"></script>
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

