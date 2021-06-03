const SocketIO = require("socket.io");

module.exports = (server) => {
  // path는 프런트랑 일치 시켜줘야됨.
  const io = SocketIO(server, { path: `/socket.io` });

  // 웹소켓 연결 시
  io.on("connection", (socket) => {
    // req는 socket안에 있음.
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(
      "새로운 클라이언트 접속! ",
      ip,
      socket.id /* 접속 시 소유한 아이디 */,
      req.ip
    );
    socket.on("disconnect", () => {
      console.log("클라 접속 하제", ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on("error", (err) => {
      console.error(err);
    });
    socket.on("reply", (data) => {
      console.log(data);
    });
    socket.interval = setInterval(() => {
      // 이벤트 이름과 메시지를 보낼수 있음.
      socket.emit("news", "Hello Socket.IO");
    }, 3000);
  });
};
