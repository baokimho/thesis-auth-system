import { createProxyMiddleware } from "http-proxy-middleware";

export const resourceProxy = createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true,
    pathRewrite: (path) => {
        const rewritten = path.replace(/^\/api\/(jwt|paseto)-resource/, "");

        // When mounted with router.use("/*-resource", proxy), root requests arrive as "/".
        return rewritten === "" || rewritten === "/" ? "/profile" : rewritten;
    },
})