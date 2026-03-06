import mongoose, { Mongoose } from "mongoose";

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

    type: {
      type: String,
      enum: ["course", "bootcamp"],
      required: [true, "Content type required"],
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

    // content: {
    //   type: Mongoose.Schema,
    //   enum: [courseSchema, bootcampSchema],
    // },

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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual property for getting the reviews of the course with the response
contentSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "content",
  localField: "_id",
});

const Content = mongoose.model("Content", contentSchema);

export default Content;
