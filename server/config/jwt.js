const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET environment variable must be set");
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
};
