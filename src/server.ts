import fastify from "fastify";

const app = fastify()

app.get("/", async function aliveRouter(request, reply) {
    return reply.status(200).send({ "status": "ok" })
})