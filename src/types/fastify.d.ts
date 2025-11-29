import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      session_id: string;
      username: string;
      email: string;
    };
  }
}
