import { createProxyMiddleware } from "http-proxy-middleware";

export const resourceProxy = createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true,
    pathRewrite: (path) => {
        const rewritten = path.replace(/^\/api\/(jwt|paseto)-resource/, "");

        // Keep backward compatibility for /api/*-resource by forwarding to /profile.
        return rewritten === "" ? "/profile" : rewritten;
    },
})