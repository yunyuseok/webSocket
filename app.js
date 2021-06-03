const express = require("express");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const nunjucks = require("nunjucks");
const ColorHash = require("color-hash");

dotenv.config();

const webSocket = require("./socket");
const indexRouter = require("./routes/index");
const connect = require("./schemas");

const app = express();

app.set("port", process.env.PORT || 5000);
app.set("view engine", "html");

nunjucks.configure("views", {
  express: app,
  watch: true,
});
connect();

const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/gif", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use((req, res, next) => {
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
  }
  next();
});

app.use("/", indexRouter);

// 404에러
app.use((req, res, next) => {
  const err = new Error(`${req.method} ${req.url} 라우타가 없습니다.`);
  err.status = 404;
  next(err);
});

// 500 에러
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV != "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 대기 중`);
});

webSocket(server, app, sessionMiddleware);
