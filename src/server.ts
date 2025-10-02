import app from "./app.ts"

app.listen({
    port: 3000
}).then(() => {
    console.log("HTTP server is running  ", 3000)
})


