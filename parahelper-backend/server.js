require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const formsRoutes = require("./routes/forms");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/forms", formsRoutes);

app.listen(port, () => {
  console.log(`ParaHelper backend listening on port ${port}`);
});
