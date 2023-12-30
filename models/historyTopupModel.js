const mongoose = require("mongoose");

const HistoryTopupSchema = new mongoose.Schema(
  {
    topupUser: {
      type: String,
      required: [true, "An History Topup must have an Topup User"],
    },
    whoTopuped: {
      type: String,
      required: [true, "An History Topup must have an Topup User"],
    },
    money: {
      type: Number,
      required: [true, "An History Topup must have a money"],
    },
    state: {
      type: String,
      enum: ["Increase", "Decrease"],
      required: [true, "A History Topup must have a state"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const HistoryTopup = mongoose.model("historyTopup", HistoryTopupSchema);

module.exports = HistoryTopup;
