const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { type } = require("os");

const subUserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [20, "A Cashier must have less or equals than 20 characters"],
    minlength: [3, "A Cashier must have less or equals than 3 characters"],
  },
  pin: {
    type: String,
    required: [true, "Please provide a pin"],
    minlength: 4,
    maxlength: 4,
    default: "1234",
    select: false,
  },
});

const discountSchema = new mongoose.Schema({
  bigID: {
    type: String,
    unique: true,
    required: [true, "Please provide a bigID"],
  },
  list: {
    type: Object,
    required: [true, "Please provide a discountList"],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowervase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      // required: [true, "Please provide your phone number"],
    },
    photo: String,
    role: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please provide your role"],
      ref: "Role",
    },
    isAgent: {
      type: Boolean,
      required: [true, "Please provide your Agent"],
      default: false,
    },
    subUser: {
      type: [subUserSchema],
      default: [
        {
          name: "Admin",
          pin: "1234",
        },
      ],
    },
    moneny: {
      type: Number,
      min: [0, "Must be at least 0"],
    },
    discountList: {
      type: [discountSchema],
    },
    // discountAgent: {
    //   type: Number,
    // },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on Save!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      // select: false,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password was acttually modified
  if (!this.isModified("password")) return next();
  // Hass the password with case of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "role",
    select: "-__v -rights",
  });
  next();
});

// find only user is active

// userSchema.pre(/^find/, function (next) {
//   // this points to the currency query
//   this.find({ active: { $ne: false } });
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
