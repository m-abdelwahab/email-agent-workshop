import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/api/webhooks/email", "routes/api/email-webhook.tsx"),
] satisfies RouteConfig;
