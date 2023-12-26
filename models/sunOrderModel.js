const mongoose = require("mongoose");

const sunOrderSchema = new mongoose.Schema(
  {
    orderUser: {
      type: String,
      required: [true, "An Order must have an Order User"],
    },
    orderCode: {
      type: String,
      required: [true, "An Order must have an Order Code"],
    },
    orderStatus: String,
    orderDate: Date,
    totalOrderPrice: Number,
    isImport: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const SunOrder = mongoose.model("sunOrder", sunOrderSchema);

module.exports = SunOrder;
