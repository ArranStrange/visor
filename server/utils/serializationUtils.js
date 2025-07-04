const mongoose = require("mongoose");

/**
 * Serialize a MongoDB document to ensure all ObjectIds are converted to strings
 * @param {Object} doc - MongoDB document or array of documents
 * @returns {Object} - Serialized document with ObjectIds as strings
 */
const serializeDocument = (doc) => {
  if (!doc) return doc;

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(serializeDocument);
  }

  // Handle objects
  if (typeof doc === "object" && doc !== null) {
    const serialized = {};

    for (const [key, value] of Object.entries(doc)) {
      if (value instanceof mongoose.Types.ObjectId) {
        serialized[key] = value.toString();
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        serialized[key] = value.map((item) => {
          if (item instanceof mongoose.Types.ObjectId) {
            return item.toString();
          }
          if (item instanceof Date) {
            return item.toISOString();
          }
          return serializeDocument(item);
        });
      } else if (typeof value === "object" && value !== null) {
        serialized[key] = serializeDocument(value);
      } else {
        serialized[key] = value;
      }
    }

    // Ensure id field is set from _id if it exists
    if (serialized._id && !serialized.id) {
      serialized.id = serialized._id;
    }

    // Additional safety check: if we have an _id but no id, always set it
    if (serialized._id && typeof serialized._id === "string") {
      serialized.id = serialized._id;
    }

    return serialized;
  }

  return doc;
};

/**
 * Serialize a specific field that might contain ObjectIds
 * @param {any} value - The value to serialize
 * @returns {any} - Serialized value
 */
const serializeField = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item instanceof mongoose.Types.ObjectId) {
        return item.toString();
      }
      if (item instanceof Date) {
        return item.toISOString();
      }
      return serializeField(item);
    });
  }
  if (typeof value === "object" && value !== null) {
    return serializeDocument(value);
  }
  return value;
};

/**
 * Serialize reactions array specifically for discussion posts
 * @param {Array} reactions - Array of reaction objects
 * @returns {Array} - Serialized reactions with ObjectIds as strings
 */
const serializeReactions = (reactions) => {
  if (!Array.isArray(reactions)) return reactions;

  return reactions.map((reaction) => ({
    ...reaction,
    users: Array.isArray(reaction.users)
      ? reaction.users.map((user) => {
          if (user instanceof mongoose.Types.ObjectId) {
            return user.toString();
          }
          if (typeof user === "object" && user !== null) {
            return {
              ...user,
              id: user.id || user._id ? (user.id || user._id).toString() : null,
            };
          }
          return user;
        })
      : reaction.users,
  }));
};

/**
 * Serialize a discussion post specifically, ensuring id field is always set
 * @param {Object} post - MongoDB post document
 * @returns {Object} - Serialized post with proper id field
 */
const serializePost = (post) => {
  if (!post) return post;

  const serialized = serializeDocument(post.toObject ? post.toObject() : post);

  // Ensure id field is always set from _id
  if (serialized._id && !serialized.id) {
    serialized.id = serialized._id;
  }

  // Handle reactions specifically
  if (serialized.reactions) {
    serialized.reactions = serializeReactions(serialized.reactions);
  }

  // Debug: Check for date serialization issues
  if (serialized.createdAt && typeof serialized.createdAt === "object") {
    console.log("⚠️ Post has invalid createdAt field:", {
      postId: serialized.id,
      createdAt: serialized.createdAt,
      createdAtType: typeof serialized.createdAt,
    });
  }

  return serialized;
};

module.exports = {
  serializeDocument,
  serializeField,
  serializeReactions,
  serializePost,
};
