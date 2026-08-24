// Reshapes a populated UserList document into the plain object shape the
// GraphQL UserList type expects. list.js previously repeated these two
// mapping blocks six times across its queries and mutations; the shapes
// differ slightly between call sites (whether owner.avatar is included,
// whether afterImage/sampleImages get reshaped), so each duplicated
// variant gets its own helper rather than forcing one shape on all of them.

// Used by featuredUserLists & browseUserLists: owner includes avatar,
// preset.afterImage / filmSim.sampleImages are reshaped to {id, url}.
const serializeUserListSummary = (list) => {
  const listObj = list.toObject();
  return {
    ...listObj,
    id: listObj._id.toString(),
    owner: {
      id: listObj.owner._id.toString(),
      username: listObj.owner.username,
      avatar: listObj.owner.avatar,
    },
    presets:
      listObj.presets?.map((preset) => ({
        ...preset,
        id: preset._id.toString(),
        afterImage:
          preset.afterImage && preset.afterImage._id
            ? {
                id: preset.afterImage._id.toString(),
                url: preset.afterImage.url,
              }
            : null,
      })) || [],
    filmSims:
      listObj.filmSims?.map((filmSim) => ({
        ...filmSim,
        id: filmSim._id.toString(),
        sampleImages:
          filmSim.sampleImages?.map((img) => ({
            id: img._id.toString(),
            url: img.url,
          })) || [],
      })) || [],
  };
};

// Used by getUserList, removeFromUserList & addToUserList: owner has no
// avatar field, preset.afterImage / filmSim.sampleImages pass through as-is.
const serializeUserListDetail = (list) => {
  const listObj = list.toObject();
  return {
    ...listObj,
    id: listObj._id.toString(),
    owner: {
      id: listObj.owner._id.toString(),
      username: listObj.owner.username,
    },
    presets:
      listObj.presets?.map((preset) => ({
        ...preset,
        id: preset._id.toString(),
        afterImage:
          preset.afterImage && preset.afterImage._id
            ? preset.afterImage
            : null,
      })) || [],
    filmSims:
      listObj.filmSims?.map((filmSim) => ({
        ...filmSim,
        id: filmSim._id.toString(),
        sampleImages: filmSim.sampleImages || [],
      })) || [],
  };
};

module.exports = { serializeUserListSummary, serializeUserListDetail };
