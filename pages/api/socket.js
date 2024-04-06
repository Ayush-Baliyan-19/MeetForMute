import { Server} from 'socket.io';


const SocketHandler = (req, res) => {
  console.log("Socket handler called");
  const httpServer= res.socket.server;

  if (httpServer.io) {
    console.log("Socket.io server already running...");
  } else {
    const io = new Server(httpServer);
    httpServer.io = io;

    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  }
  res.end();
}

export default SocketHandler;
