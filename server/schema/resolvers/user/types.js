const User = require("../../../models/User");

module.exports = {
  presets: async (parent) => {
    const user = await User.findById(parent.id || parent._id).populate({
      path: "uploadedPresets",
      populate: [
        { path: "tags" },
        { path: "creator" },
        { path: "likes" },
        { path: "beforeImage" },
        { path: "afterImage" },
        { path: "sampleImages" },
      ],
    });
    if (!user || !user.uploadedPresets) return [];
    return user.uploadedPresets.map((p) => ({
      ...p.toObject(),
      id: p._id.toString(),
      creator: p.creator
        ? { ...p.creator.toObject(), id: p.creator._id.toString() }
        : null,
      tags:
        p.tags?.map((t) => ({ ...t.toObject(), id: t._id.toString() })) || [],
      likes:
        p.likes?.map((l) => ({ ...l.toObject(), id: l._id.toString() })) ||
        [],
      beforeImage: p.beforeImage
        ? { ...p.beforeImage.toObject(), id: p.beforeImage._id.toString() }
        : null,
      afterImage: p.afterImage
        ? { ...p.afterImage.toObject(), id: p.afterImage._id.toString() }
        : null,
      sampleImages:
        p.sampleImages?.map((i) => ({
          ...i.toObject(),
          id: i._id.toString(),
        })) || [],
    }));
  },
  filmSims: async (parent) => {
    const user = await User.findById(parent.id || parent._id).populate({
      path: "uploadedFilmSims",
      populate: [
        { path: "tags" },
        { path: "creator" },
        { path: "sampleImages" },
      ],
    });
    if (!user || !user.uploadedFilmSims) return [];

    return user.uploadedFilmSims.map((f) => ({
      ...f.toObject(),
      id: f._id.toString(),
      creator: f.creator
        ? { ...f.creator.toObject(), id: f.creator._id.toString() }
        : null,
      tags:
        f.tags?.map((t) => ({ ...t.toObject(), id: t._id.toString() })) || [],
      likes: [],
      sampleImages:
        f.sampleImages?.map((i) => ({
          ...i.toObject(),
          id: i._id.toString(),
        })) || [],
    }));
  },
};
