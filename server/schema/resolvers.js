module.exports = {
  Query: {
    currentUser: async (_, __, { user }) => {
      return user;
    },
  },
  Mutation: {
    register: async (_, { username, email, password }, { User }) => {
      const newUser = new User({ username, email, password });
      await newUser.save();
      return "Registration successful";
    },
  },
};
