const populateFilmSim = (query) => {
  return query
    .populate({
      path: "creator",
      select: "username avatar instagram",
    })
    .populate({
      path: "tags",
      select: "name displayName",
    })
    .populate({
      path: "sampleImages",
      select: "url caption",
    })
    .populate({
      path: "comments.user",
      select: "username avatar",
    })
    .populate({
      path: "recommendedPresets",
      select: "title slug tags afterImage",
      populate: {
        path: "afterImage",
        select: "url publicId",
      },
    });
};

module.exports = { populateFilmSim };
