const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = `
type Query {
  allTags: [String!]!
}
`;
