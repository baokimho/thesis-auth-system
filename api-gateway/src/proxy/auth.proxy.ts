import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const AUTH_SERVICE_TARGET = "http://localhost:3001";

export const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_TARGET,
  changeOrigin: true,
  pathRewrite: (path) => {
    const stripped = path
      .replace(/^\/api\/auth/, "")
      .replace(/^\/auth/, "");

    if (stripped === "" || stripped === "/") {
      return "/auth/health";
    }

    return `/auth${stripped.startsWith("/") ? stripped : `/${stripped}`}`;
  },
  on: {
    proxyReq: fixRequestBody,
  },
});
