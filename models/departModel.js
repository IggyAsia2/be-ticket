const mongoose = require("mongoose");

const cashierSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [40, "A Cashier must have less or equals than 40 characters"],
    minlength: [6, "A Cashier must have less or equals than 6 characters"],
  },
  order: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
    // select: false,
  },
  note: String,
}); 

const departSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Department must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A Department must have less or equals than 40 characters",
      ],
      minlength: [6, "A Department must have less or equals than 6 characters"],
    },
    phone: String,
    cashiers: {
      type: [cashierSchema],
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
  }
);
// Aggregation Middleware

const Depart = mongoose.model("depart", departSchema);

module.exports = Depart;
