import mongoose from "mongoose";

const contentOptions = {
  discriminatorKey: "contentType",
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

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
      public_id: String,
      url: String,
      uploadedAt: Date,
      _id: false,
    },

    welcomeVideo: {
      public_id: String,
      url: String,
      uploadedAt: Date,
      _id: false,
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

    metadata: {
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
        required: [true, "Content pre requisites required"],
      },

      modulesCount: {
        type: Number,
        default: 0,
      },

      duration: {
        type: Number,
        default: 0,
      },

      totalStudentsEnrolled: {
        type: Number,
        default: 0,
      },

      ratingsCount: {
        type: Number,
        default: 0,
      },

      avgRatings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  },
  contentOptions,
);

// Virtual property for getting the reviews of the course with the response
contentSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "content",
  localField: "_id",
});

const courseSchema = new mongoose.Schema(
  {
    modules: [
      {
        title: String,
        lessons: [
          {
            title: String,
            videoUrl: String,
            duration: Number,
            isCompleted: { type: Boolean, default: false },
          },
        ],
      },
    ],
    totalLessons: Number,
    totalDuration: Number,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: false },
);

const bootcampSchema = new mongoose.Schema(
  {
    startDate: Date,
    endDate: Date,
    schedule: {
      _id: false,
      days: [
        {
          type: String,
          enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
      ],
      timeStart: String, // "09:00"
      timeEnd: String, // "17:00"
      timezone: { type: String, default: "Asia/Riyadh" },
    },
    projects: [
      {
        title: String,
        description: String,
        githubUrl: String,
        liveUrl: String,
      },
    ],
    totalProjects: Number,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: false },
);

contentSchema.pre("save", function () {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }
  return;
});

// Create the parent model
const Content = mongoose.model("Content", contentSchema);

// Create the child models using discriminator
const Course = Content.discriminator("course", courseSchema);
const Bootcamp = Content.discriminator("bootcamp", bootcampSchema);

export { Content, Course, Bootcamp };
