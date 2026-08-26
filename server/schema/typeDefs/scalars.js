const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Upload
  scalar JSON
  scalar ObjectId
  scalar StringOrInt

  """
  Ordering for the discovery lists. Shared by listPresets and listFilmSims so
  the two grids cannot drift apart.

  POPULAR reads the denormalised popularityScore (download 3, save 2, like 1),
  which is maintained by \$inc at each mutation. It is deliberately named
  POPULAR, not TRENDING: the score has no time decay, so the label must not
  promise recency the implementation does not provide.
  """
  enum ContentSort {
    NEWEST
    POPULAR
    MOST_DOWNLOADED
    MOST_SAVED
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;
