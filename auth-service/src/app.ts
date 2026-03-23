import express from "express";
import routes from "./routes";
import { validateInternalSecret } from "./middleware/internalSecretValidate.middleware";

const app = express();

app.use(express.json());
app.use(validateInternalSecret);

app.use("/auth", routes);

export default app;