const aggregateRatings = async function (contentId, reviewModel, contentModel) {
  try {
    const result = await reviewModel.aggregate([
      { $match: { content: contentId } },
      {
        $group: {
          _id: "$content",
          avgRatings: { $avg: "$rating" },
          ratingsCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await contentModel.findByIdAndUpdate(contentId, {
        "metadata.avgRatings": result[0]?.avgRatings,
        "metadata.ratingsCount": result[0]?.ratingsCount,
      });
    } else {
      await contentModel.findByIdAndUpdate(contentId, {
        "metadata.avgRatings": null,
        "metadata.ratingsCount": null,
      });
    }
  } catch (error) {
    console.error("Error aggregating ratings:", error);
    throw new Error(error);
  }
};

export { aggregateRatings };
