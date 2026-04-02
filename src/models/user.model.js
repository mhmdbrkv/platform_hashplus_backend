import mongoose from "mongoose";
import bcrypt from "bcrypt";

const instructorDetailsSchema = new mongoose.Schema(
  {
    bio: { type: String, trim: true, default: "" },
    teachingStyle: { type: String, trim: true, default: "" },
    videoProfessionality: { type: String, trim: true, default: "" },
    targetAudience: { type: String, trim: true, default: "" },
    skills: { type: [String], default: [] },
    languages: {
      type: [{ language: String, proficiency: String }],
      default: [],
    },
    experience: {
      type: [
        {
          company: String,
          country: String,
          city: String,
          jobTitle: String,
          jobType: String,
          jobStyle: String,
          startDate: Date,
          endDate: Date,
          skills: { type: [String], default: [] },
          description: String,
          isCurrent: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          institution: String,
          degree: String,
          major: String,
          startDate: Date,
          endDate: Date,
          description: String,
          isCurrent: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    rating: { type: Number, min: 0, max: 5 },
    createdContent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],

    totalRating: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalCreatedContent: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
  },
  { _id: false, timestamps: true },
);

const studentDetailsSchema = new mongoose.Schema(
  {
    bio: { type: String, trim: true },
    certificates: [
      {
        contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
        certificateUrl: String,
        issuedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: false, timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
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

    instructorDetails: { type: instructorDetailsSchema, default: () => ({}) },
    studentDetails: { type: studentDetailsSchema, default: () => ({}) },

    role: {
      type: String,
      enum: ["user", "admin", "instructor"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,

    isSubscribed: { type: Boolean, default: false },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

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
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    throw error;
  }
});

// mongoose query middleware for populating the `subscription` field
userSchema.pre(/^find/, function () {
  try {
    this.populate({
      path: "subscription",
      select: "subscriptionDetails paymentDetails isActive",
    });
  } catch (error) {
    throw error;
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
