module.exports = {
  validateMongoURI: (uri) => {
    if (
      !uri ||
      !(uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))
    ) {
      console.error(
        "MONGODB_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)"
      );
      process.exit(1);
    }
  },

  maskCredentials: (uri) => {
    return uri.replace(/:[^:@]*@/, ":****@");
  },
};
