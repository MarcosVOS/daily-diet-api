import { app } from "./app.ts";
import { env } from "./env/index.ts";

app
  .listen({
    port: 3000,
  })
  .then(() => {
    console.log("HTTP server is running  ", env.DAILY_DIET_API_PORT);
  });
