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

    slug: {
      type: String,
      trim: true,
    },

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
      type: Number,
      required: [true, "Content price required"],
      min: 0,
    },

    thumbnail: {
      public_id: String,
      url: String,
      uploadedAt: Date,
    },

    materials: {
      type: [String],
    },

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

      learningPreRequisites: {
        type: [String],
        required: [true, "Content pre requisites required"],
      },

      duration: {
        type: Number,
      },

      numberOfModules: {
        type: Number,
        default: 0,
      },

      totalStudentsEnrolled: {
        type: Number,
        default: 0,
      },

      ratingsNumber: {
        type: Number,
        default: 0,
      },

      avgRatings: {
        type: Number,
        default: 0,
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

const courseSchema = new mongoose.Schema({
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
});

const bootcampSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  schedule: String,
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
});

// Create the parent model
const Content = mongoose.model("Content", contentSchema);

// Create the child models using discriminator
const Course = Content.discriminator("course", courseSchema);
const Bootcamp = Content.discriminator("bootcamp", bootcampSchema);

export { Content, Course, Bootcamp };
