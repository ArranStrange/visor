const { GraphQLUpload } = require("graphql-upload");
const GraphQLJSON = require("graphql-type-json");
const { GraphQLScalarType } = require("graphql");

const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "ObjectId custom scalar type",
  serialize(value) {
    if (value instanceof require("mongoose").Types.ObjectId) {
      return value.toString();
    }
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    return ast.value;
  },
});

const StringOrIntScalar = new GraphQLScalarType({
  name: "StringOrInt",
  description: "String or Int custom scalar type",
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    return ast.value;
  },
});

module.exports = {
  Upload: GraphQLUpload,
  JSON: GraphQLJSON,
  ObjectId: ObjectIdScalar,
  StringOrInt: StringOrIntScalar,
};
