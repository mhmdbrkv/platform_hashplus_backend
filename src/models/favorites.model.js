import mongoose from "mongoose";

const favoritesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User required"],
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: [true, "Content required"],
    },
  },
  { timestamps: true },
);

const Favorites = mongoose.model("Favorites", favoritesSchema);

export default Favorites;
