import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "User name required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email required"],
      unique: [true, "User email already exists"],
      trim: true,
    },
    password: { type: String },
    profileImage: {
      public_id: String,
      url: String,
      uploadedAt: Date,
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,

    otpCode: String,
    otpEat: Date,
    otpIsVerified: { type: Boolean, default: false },

    passResetCode: String,
    passResetCodeEat: Date,
    passResetCodeVerified: Boolean,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// pre-save hook to hash password before saving in db
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    if (!this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// mongoose method to compare passwords
userSchema.methods = {
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  },
};

const User = mongoose.model("User", userSchema);

export default User;
