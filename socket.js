const SocketIo = require("socket.io");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cookie = require("cookie-signature");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIo(server, { path: `/socket.io` });
  app.set("io", io); // req.app.get("io"); 를 할수 있게됨.)
  const room = io.of("/room");
  const chat = io.of("/chat");
  // socketIo는 계층적구조를 가지고 있음.
  // 그래서 이런식으로 계층적으로 구분해서 데이터를 보내기가 가능
  // io(전체)
  // namesapce(같은 네임스페이스끼리)
  // room(방에 참여한 사람들끼리)
  // socketID (아이디를 가진 한명과만)

  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

  chat.use(wrap(cookieParser(process.env.COOKIE_SECRET)));
  chat.use(wrap(sessionMiddleware));

  room.on("connection", (socket) => {
    console.log("room 네임스페이스에 접속");
    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat 네임스페이스에 접속");
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    // 프런트에서 서버로 데이터가 어떤식으로 가는지 보면 좋음.
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, "");
    // socketIo의 기본 제공함수
    socket.join(roomId);
    socket.to(roomId).emit("join", {
      user: "system",
      chat: `${req.session.color}님이 입장하셨습니다.`,
    });

    socket.on("disconnect", () => {
      console.log("chat 네임스페이스 접속 해제");
      // socketIo의 기본 제공함수
      socket.leave(roomId);
      const currentRoom = socket.adapter.rooms.get(roomId);
      const userCount = currentRoom ? currentRoom.size : 0;
      if (userCount === 0) {
        // 유저가 0명이면 방 삭제
        const signedCookie = cookie.sign(
          req.signedCookies["connect.sid"],
          process.env.COOKIE_SECRET
        );
        const connectSID = `${signedCookie}`;
        axios
          .delete(`http://localhost:5000/room/${roomId}`, {
            headers: {
              Cookie: `connect.sid=s%3A${connectSID}`,
            },
          })
          .then(() => {
            console.log("방 제거 요청 성공");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
        });
      }
    });
  });
};
