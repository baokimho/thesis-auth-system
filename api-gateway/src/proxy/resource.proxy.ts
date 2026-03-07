import { createProxyMiddleware } from "http-proxy-middleware";

export const resourceProxy = createProxyMiddleware({
    target: "http://localhost:4000/profile",
    changeOrigin: true, 
    pathRewrite: {
        "^/api/resource": "",
    }
})