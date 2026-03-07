import { createProxyMiddleware } from "http-proxy-middleware";

export const resourceProxy = createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true, 
    pathRewrite: {
        "^/api/resource": "",
    }
})