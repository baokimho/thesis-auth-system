import express from "express";

const app = express();

app.use(express.json());

// test endpoint
app.get("/profile", (req, res) => {
  const userId = req.headers["x-user-id"];
  const email = req.headers["x-user-email"];

  res.json({
    message: "Profile data from resource service",
    userId,
    email
  });
});

app.get("/orders", (req, res) => {
  const userId = req.headers["x-user-id"];

  res.json({
    message: "Orders for user",
    userId,
    orders: ["order1", "order2"]
  });
});

app.listen(4000, () => {
  console.log("Resource service running on port 4000");
});