const mongoose = require("mongoose");
const slugify = require("slugify");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, default: 0 },
    customerName: {
      type: String,
      required: [true, "An Order must have a name"],
    },
    // customerEmail: {
    //   type: String,
    //   required: [true, "An Order must have an email "],
    // },
    // customerPhone: {
    //   type: String,
    //   required: [true, "An Order must have a phone number "],
    // },
    // quantity: {
    //   type: Number,
    //   required: [true, "An Order must have a quantity"],
    // },
    // unitPrice: {
    //   type: Number,
    //   required: [true, "An Order must have an unitPrice"],
    // },
    // subTotal: Number,
    // paidDate: {
    //   type: Date,
    //   required: [true, "An Order must have have a Paid Date"],
    // },
    // bookDate: {
    //   type: Date,
    //   required: [true, "An Order must have have a Book Date"],
    // },
    // exportUser: {
    //   type: String,
    //   required: [true, "An Order must have an Import User"],
    // },
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    // },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
  }
);

// OrderSchema.pre("save", function (next) {
//   this.orderId = this.orderId + 1;
//   next();
// });

// Aggregation Middleware

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
