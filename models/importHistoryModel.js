const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    sku: String,
    name: String,
    bigTicket: String,
    unit: String,
    quantity: Number,
  },
  { _id: false }
);

const ImportHistorySchema = new mongoose.Schema(
  {
    importUser: {
      type: String,
      required: [true, "An Order must have an Import User"],
    },
    importID: {
      type: String,
      required: [true, "An Order must have an Import ID"],
    },
    importType: {
      type: String,
      enum: ["Excel", "Random"],
      required: [true, "An Order must have an Import Type"],
    },
    ticket: {
      type: [ticketSchema],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ImportHistory = mongoose.model("importHistory", ImportHistorySchema);

module.exports = ImportHistory;
