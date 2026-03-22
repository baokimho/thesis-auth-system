import express from "express";
import routes from "./routes";

const app = express();

app.set('trust proxy', 1);

app.use(express.json());
// logging middleware
app.use((req, _res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

app.use("/api", routes);

export default app;