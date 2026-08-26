const Query = require("./queries");
const Mutation = require("./mutations");
const types = require("./types");

module.exports = {
  Query,
  Mutation,
  ...types,
};
