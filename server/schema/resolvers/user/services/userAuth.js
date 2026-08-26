const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { JWT_SECRET } = require("../../../../config/jwt");
const { ValidationError } = require("../../../../utils/errors");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

const MIN_PASSWORD_LENGTH = 8;

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter"
    );
  }
};

const validateUsername = (username) => {
  if (username.length < 3) {
    throw new ValidationError("Username must be at least 3 characters long");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError(
      "Username can only contain letters, numbers, and underscores"
    );
  }
};

const handleFileUpload = async (file, directory) => {
  const { createReadStream, filename } = await file;

  const uploadDir = path.join(__dirname, "..", "..", "..", "..", "uploads", directory);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(uploadDir, uniqueFilename);

  const writeStream = fs.createWriteStream(filepath);

  await new Promise((resolve, reject) => {
    createReadStream()
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });

  return `/${directory}/${uniqueFilename}`;
};

module.exports = {
  generateToken,
  validateEmail,
  validatePassword,
  validateUsername,
  handleFileUpload,
  MIN_PASSWORD_LENGTH,
};
