module.exports = {
  validateMongoURI: (uri) => {
    if (!uri || !uri.startsWith("mongodb+srv://")) {
      console.error(
        "MONGODB_URI must be a valid MongoDB Atlas connection string"
      );
      process.exit(1);
    }
  },

  maskCredentials: (uri) => {
    return uri.replace(/:[^:@]*@/, ":****@");
  },
};
