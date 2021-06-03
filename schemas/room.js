const mongoose = require("mongoose");

const { Schema } = mongoose;
const roomSchema = new Schema({
  // sequelize랑 같이 _id가 숨겨져 있음.
  title: {
    type: String,
    required: true, //필수인지
  },
  max: {
    type: Number,
    required: true,
    default: 10,
    min: 2,
  },
  owner: {
    type: String,
    required: true,
  },
  // 타입만 필요한 경우 이렇게 줄일 수 있음.
  password: String,
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", roomSchema);
