import mongoose from "mongoose";
import slugify from "slugify";

// ─────────────────────────────────────────────
// Shared options
// ─────────────────────────────────────────────
const contentOptions = {
  discriminatorKey: "contentType",
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

// ─────────────────────────────────────────────
// Base Content Schema
// ─────────────────────────────────────────────
const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Content title required"],
      trim: true,
    },

    slug: { type: String, trim: true, unique: true, index: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Content category required"],
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Content instructor required"],
    },

    description: {
      type: String,
      required: [true, "Content description required"],
      trim: true,
    },

    learningOutcomes: {
      type: [String],
      required: [true, "Content learning outcomes required"],
    },

    prerequisites: {
      type: [String],
      required: [true, "Content pre-requisites required"],
    },

    welcomeMessage: { type: String, trim: true, default: "" },

    congratulationsMessage: { type: String, trim: true, default: "" },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: { type: String, enum: ["ar", "en", "fr"], default: "ar" },

    materials: { type: [String], default: [] },

    price: {
      amount: {
        type: Number,
        required: [true, "Price amount required"],
        min: 0,
      },
      currency: { type: String, default: "SAR" },
      _id: false,
    },

    thumbnail: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
      uploadedAt: Date,
      _id: false,
    },

    welcomeVideo: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
      uploadedAt: Date,
      _id: false,
    },

    // ✅ Denormalized metadata — updated explicitly via service layer or middleware
    metadata: {
      modulesCount: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      totalStudentsEnrolled: { type: Number, default: 0 },
      ratingsCount: { type: Number, default: 0 },
      avgRatings: { type: Number, default: 0, min: 0, max: 5 },
    },
  },
  contentOptions,
);

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
contentSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "content",
  localField: "_id",
});

// ─────────────────────────────────────────────
// Slug pre-save — handles duplicates gracefully
// ─────────────────────────────────────────────
contentSchema.pre("save", async function () {
  if (this.isModified("title") || !this.slug) {
    const base = slugify(this.title);

    const existing = await Content.findOne({
      slug: new RegExp(`^${base}(-\\d+)?$`),
      _id: { $ne: this._id },
    });

    this.slug = existing ? `${base}-${Date.now()}` : base;
  }
});

// ─────────────────────────────────────────────
// Module subdocument discriminators (Course)
// ─────────────────────────────────────────────

// Base module schema — discriminatorKey matches the existing "moduleType" field
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 }, // ✅ Explicit ordering field
  },
  { discriminatorKey: "moduleType", _id: true },
);

const videoModuleSchema = new mongoose.Schema({
  video: {
    url: { type: String, default: "" },
    key: { type: String, default: "" },
    uploadId: { type: String, default: "" },
    size: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    uploadedAt: Date,
    _id: false,
  },
});

const quizModuleSchema = new mongoose.Schema({
  quiz: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      // ✅ answer excluded from API responses by default
      answer: { type: String, required: true, select: false },
    },
  ],
});

const taskModuleSchema = new mongoose.Schema({
  task: {
    url: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    uploadedAt: Date,
    _id: false,
  },
});

const linkModuleSchema = new mongoose.Schema({
  link: {
    url: { type: String, default: "" },
    description: { type: String, default: "" },
    _id: false,
  },
});

// ─────────────────────────────────────────────
// Course Schema
// ─────────────────────────────────────────────
const courseSchema = new mongoose.Schema(
  {
    modules: [moduleSchema],
  },
  { _id: false, timestamps: true },
);

// Register module discriminators on the modules array path
const modulesArray = courseSchema.path("modules");
modulesArray.discriminator("video", videoModuleSchema);
modulesArray.discriminator("quiz", quizModuleSchema);
modulesArray.discriminator("task", taskModuleSchema);
modulesArray.discriminator("link", linkModuleSchema);

// ─────────────────────────────────────────────
// Bootcamp Schema
// ─────────────────────────────────────────────
const bootcampSchema = new mongoose.Schema(
  {
    startDate: Date,
    endDate: Date,

    modules: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },

        timeStart: String, // "09:00"
        timeEnd: String, // "17:00"
        timezone: { type: String, default: "Asia/Riyadh" },

        liveSession: {
          url: { type: String, default: "" },
          _id: false,
        },

        video: {
          key: { type: String, default: "" },
          url: { type: String, default: "" },
          duration: { type: Number, default: 0 },
          size: { type: Number, default: 0 },
          uploadedAt: Date,
          _id: false,
        },

        projects: [
          {
            title: String,
            description: String,
            githubUrl: String,
            liveDemoUrl: String,
          },
        ],
      },
    ],

    totalProjects: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ─────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────
const Content = mongoose.model("Content", contentSchema);
const Course = Content.discriminator("course", courseSchema);
const Bootcamp = Content.discriminator("bootcamp", bootcampSchema);

export { Content, Course, Bootcamp };
