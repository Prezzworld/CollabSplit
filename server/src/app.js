const express = require("express")
const app = express()
const cors = require("cors")


app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CollabSplit API is live and ready for revenue splitting"
  })
})

module.exports = app