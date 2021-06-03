const mongoose = require("mongoose");

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
// 로그인을 할때 필요한 주소
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect = () => {
  if (NODE_ENV !== "production") {
    // 이거 해주면 콘솔에서 몽고디비 쿼리가 나옴
    mongoose.set("debug", true);
  }
  mongoose.connect(
    MONGO_URL,
    {
      // 실제 사용할 db
      dbName: "gifchat",
      // 밑에 두개는 몽구스 업데이트하면서 이전 꺼 때문에
      // 무조건 true로 만들어줘야하는 옵션들
      useNewUrlParser: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) {
        console.log("몽고디비 연결 에러", err);
      } else {
        console.log("몽고디비 연결 성공");
      }
    }
  );
};

mongoose.connection.on("error", (err) => {
  console.error("몽고디비 연결 에러", err);
});

mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다.");
  connect();
});

module.exports = connect;
