const FilmSim = require("../../../models/FilmSim");
const { createLogger } = require("../../../utils/logger");
const { clampPagination } = require("../../../utils/pagination");
const { populateFilmSim } = require("./services/populateFilmSim");
const {
  buildContentSort,
  buildFilmSimListQuery,
} = require("../../../utils/contentFilters");

const logger = createLogger("resolvers:filmSim");

module.exports = {
  getFilmSim: async (_, { slug }) => {
    try {
      const filmSim = await populateFilmSim(FilmSim.findOne({ slug }));

      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      return filmSim;
    } catch (error) {
      logger.error("Error in getFilmSim", error);
      throw error;
    }
  },

  listFilmSims: async (_, { filter, where, search, sort, page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );

      const query = await buildFilmSimListQuery({ filter, where, search });

      const [filmSims, totalCount] = await Promise.all([
        populateFilmSim(
          FilmSim.find(query)
            .sort(buildContentSort(sort))
            .skip(skip)
            .limit(safeLimit)
        ),
        FilmSim.countDocuments(query),
      ]);

      // Serialize film sims to include id field properly
      const serializedFilmSims = filmSims.map((filmSim) => {
        const filmSimObj = filmSim.toObject();
        return {
          ...filmSimObj,
          id: filmSimObj._id.toString(),
          creator: filmSimObj.creator
            ? {
                ...filmSimObj.creator,
                id:
                  filmSimObj.creator._id?.toString() || filmSimObj.creator.id,
              }
            : null,
          tags: (filmSimObj.tags || []).map((tag) => ({
            ...tag,
            id: tag._id?.toString() || tag.id,
          })),
        };
      });

      const totalPages = Math.ceil(totalCount / safeLimit);
      const hasNextPage = safePage < totalPages;
      const hasPreviousPage = safePage > 1;

      return {
        filmSims: serializedFilmSims,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        currentPage: safePage,
        totalPages,
      };
    } catch (error) {
      logger.error("Error listing film simulations", error);
      throw new Error("Failed to list film simulations: " + error.message);
    }
  },
};
