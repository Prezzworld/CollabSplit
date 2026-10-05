require("dotenv").config()
// const dns = require("dns")
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("./config/db")
const app = require("./app")

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})