const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, default: 1 },
    state: {
      type: String,
      enum: ["Finished", "Canceled", "Pending"],
      required: [true, "A Order must have a state"],
      default: "Pending",
    },
    groupTicket: {
      type: mongoose.Schema.ObjectId,
      ref: "groupTicket",
      required: [true, "A Order must belong to a Group Ticket"],
    },
    allOfTicket: {
      type: Array,
      require: [true, "An Order must have a ticket"]
    },
    customerName: {
      type: String,
      required: [true, "An Order must have a name"],
    },
    customerEmail: {
      type: String,
      required: [true, "An Order must have an email "],
    },
    customerPhone: {
      type: String,
      required: [true, "An Order must have a phone number "],
    },
    quantity: {
      type: Number,
      required: [true, "An Order must have a quantity"],
    },
    subTotal: Number,
    price: Number,
    paidDate: {
      type: Date,
      required: [true, "An Order must have have a Paid Date"],
    },
    bookDate: {
      type: Date,
      required: [true, "An Order must have have a Book Date"],
    },
    exportUser: {
      type: String,
      required: [true, "An Order must have an Import User"],
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
    timestamps: true
  }
);

OrderSchema.pre(/^find/, function (next) {
  // All string start with find
  this.populate("groupTicket", ["name", "sku", "unit", "price"]);
  next();
});
// Aggregation Middleware

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
