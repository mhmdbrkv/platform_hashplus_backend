const aggregateRatings = async function (contentId, reviewModel, contentModel) {
  const result = await reviewModel.aggregate([
    { $match: { content: contentId } },
    {
      $group: {
        _id: "$content",
        avgRatings: { $avg: "$rating" },
        ratingsNumber: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await contentModel.findByIdAndUpdate(contentId, {
      avgRatings: result[0].avgRatings,
      ratingsNumber: result[0].ratingsNumber,
    });
  }
};

export { aggregateRatings };
