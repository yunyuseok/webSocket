const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  // 웹소켓 연결 시
  wss.on("connection", (ws, req) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("새로운 클라이언트 접속", ip);

    // 클라 메시지 처리
    ws.on("message", (message) => {
      console.log(message);
    });

    // 클라와 연결 종료시
    ws.on("close", () => {
      console.log("클라이언트 접속 해제", ip);
      clearInterval(ws.interval);
    });

    ws.interval = setInterval(() => {
      // 연결된 상태라면
      if (ws.readyState === ws.OPEN) {
        ws.send("서버에서 클라로 메시지를 보냅니다.");
      }
    }, 3000);
  });
};
