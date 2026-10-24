const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const publicPayRoutes = require("./routes/public.routes");
const webhookRoutes = require("./routes/webhook.routes");

app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/pay", publicPayRoutes);
app.use("/api/v1/webhooks", webhookRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CollabSplit API is live and ready for revenue splitting",
  });
});

app.use(errorHandler);

module.exports = app;
