const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
const cors = require("cors")
const morgan = require("morgan")

const app = express()

// to store the PORT poperty
require("dotenv").config()

app.use(cors())
app.use(morgan("dev"))
app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(express.json())

//connecting to the server
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: ["http://192.168.34.108:8000/"],
    // origin: "http://10.124.21.248:8000/",
    methods: ["GET", "HEAD", "POST"],
  },
})
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// socket connection to the frontEnd
io.on("connection", (socket) => {
  console.log("Conected user", socket.id)
  socket.on("connect", () => {
    console.log(socket.connected)
  })
  socket.on("roomCreated", (btnDisable, roomId, count) => {
    socket.join(roomId)
    socket.broadcast.emit("roomCreated", btnDisable, roomId, count)
  })
   socket.on("closeModal", () => {
     io.emit("closeModal")
   })
 socket.on("restart", (newGameState) => {
   // Broadcast the updated game state to all clients
   io.emit("player", newGameState)
 })
  socket.on("player", (state) => {
    // state.click = !state.click
    socket.broadcast.emit("player", state)
  })
})

const home = async () => {
  try {
    server.listen(process.env.PORT, () => {
      // const address = server.address()
      console.log(`Server connected at ${process.env.PORT}`)

      // console.log(`Server connected at ${process.env.PORT}....`)
    })
  } catch (error) {
    console.log(error)
  }
}

home()
