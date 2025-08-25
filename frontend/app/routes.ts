import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("fun", "routes/fun.tsx"),
  route("grocery-list", "routes/grocery-list.tsx"),
] satisfies RouteConfig;
