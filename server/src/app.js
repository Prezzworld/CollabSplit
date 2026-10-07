const express = require("express")
const app = express()
const cors = require("cors")
const errorHandler = require("./middlewares/error.middleware")
const authRoutes = require("./routes/auth.routes")


app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", authRoutes)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CollabSplit API is live and ready for revenue splitting"
  })
})

app.use(errorHandler)

module.exports = app