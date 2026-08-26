const FilmSim = require("../../../../models/FilmSim");
const { requireAuth } = require("../../../../utils/authHelpers");
const { addLike, removeLike } = require("../../../../utils/likes");

// `likeFilmSim` has been declared in the schema since the beginning with no
// resolver behind it: the merge in ./index.js only pulled in crud, comment and
// recommendation mutations, so the field resolved to null and every like was
// silently discarded (#128).

module.exports = {
  likeFilmSim: async (_, { filmSimId }, { user }) => {
    requireAuth(user, "You must be logged in to like a film sim");
    return addLike(FilmSim, filmSimId, user, "Film sim");
  },

  unlikeFilmSim: async (_, { filmSimId }, { user }) => {
    requireAuth(user, "You must be logged in to unlike a film sim");
    return removeLike(FilmSim, filmSimId, user, "Film sim");
  },
};
