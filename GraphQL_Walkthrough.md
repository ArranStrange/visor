# GraphQL in VISOR: A Complete Junior Developer Walkthrough

## Table of Contents

1. [What is GraphQL and Why We Use It](#what-is-graphql-and-why-we-use-it)
2. [Architecture Overview](#architecture-overview)
3. [Server-Side Implementation](#server-side-implementation)
4. [Client-Side Implementation](#client-side-implementation)
5. [Real-World Examples](#real-world-examples)
6. [Error Handling & Best Practices](#error-handling--best-practices)
7. [Testing with Cypress](#testing-with-cypress)
8. [Common Patterns & Tips](#common-patterns--tips)

---

## What is GraphQL and Why We Use It

### What is GraphQL?

GraphQL is a query language and runtime for APIs that allows clients to request exactly the data they need. Unlike REST APIs where you make multiple requests to different endpoints, GraphQL provides a single endpoint that can fetch related data in one request.

### Why VISOR Uses GraphQL

1. **Efficient Data Fetching**: Our app deals with complex relationships (users, film simulations, presets, comments, tags). GraphQL lets us fetch all related data in one request.
2. **Type Safety**: GraphQL provides a strong type system that helps catch errors at development time.
3. **Real-time Capabilities**: Perfect for our discussion features and notifications.
4. **Flexible Queries**: Frontend can request only the fields needed, reducing payload size.

### GraphQL vs REST in VISOR Context

```javascript
// REST approach - multiple requests needed
GET /api/users/123
GET /api/users/123/filmsims
GET /api/users/123/lists
GET /api/users/123/notifications

// GraphQL approach - single request
query GetUserProfile($userId: ID!) {
  getUser(id: $userId) {
    username
    avatar
    filmSims {
      name
      thumbnail
      tags { displayName }
    }
    lists {
      name
      itemCount
    }
    notifications {
      message
      read
    }
  }
}
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    GraphQL     ┌─────────────────┐
│   React Client  │ ◄─────────────► │  Apollo Server  │
│                 │                 │                 │
│ - Apollo Client │                 │ - Schema        │
│ - Queries       │                 │ - Resolvers     │
│ - Mutations     │                 │ - Context       │
└─────────────────┘                 └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │    MongoDB      │
                                    │                 │
                                    │ - Users         │
                                    │ - FilmSims      │
                                    │ - Presets       │
                                    │ - Comments      │
                                    └─────────────────┘
```

### Project Structure

```
server/
├── schema/
│   ├── typeDefs/          # GraphQL schema definitions
│   │   ├── user.js        # User type definition
│   │   ├── filmSim.js     # FilmSim type definition
│   │   └── ...
│   └── resolvers/         # Business logic
│       ├── user.js        # User resolvers
│       ├── filmSim.js     # FilmSim resolvers
│       └── ...
└── index.js               # Apollo Server setup

client/src/graphql/
├── apolloClient.ts        # Apollo Client configuration
├── queries/               # GraphQL queries
├── mutations/             # GraphQL mutations
├── fragments/             # Reusable field sets
└── schema/                # Generated schema types
```

---

## Server-Side Implementation

### 1. Apollo Server Setup (`server/index.js`)

The server setup is where everything comes together:

```javascript
// Import all type definitions and resolvers
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const filmSimTypeDefs = require("./schema/typeDefs/filmSim");
const filmSimResolvers = require("./schema/resolvers/filmSim");
// ... other imports

// Merge all schemas into one
const typeDefs = mergeTypeDefs([
  scalarsTypeDefs,
  filmSimTypeDefs,
  // ... other typeDefs
]);

// Merge all resolvers into one
const resolvers = mergeResolvers([
  scalarsResolvers,
  filmSimResolvers,
  // ... other resolvers
]);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Authentication context
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return { user: null };
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      return { user: user ? { ...user.toObject(), id: user._id } : null };
    } catch (err) {
      return { user: null };
    }
  },
});
```

**Key Concepts:**

- **Context**: Available to all resolvers, contains user authentication info
- **Schema Merging**: Combines multiple type definitions and resolvers
- **Authentication**: JWT token validation happens in context function

### 2. Type Definitions (`server/schema/typeDefs/filmSim.js`)

Type definitions describe the shape of your data:

```javascript
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Define nested types
  type FilmSimSettings {
    dynamicRange: Int
    highlight: Int
    shadow: Int
    colour: Int
    sharpness: Int
    # ... other settings
  }

  # Main entity type
  type FilmSim {
    id: ID! # Required field (!)
    name: String!
    slug: String!
    description: String # Optional field (no !)
    settings: FilmSimSettings
    tags: [Tag] # Array of Tag objects
    creator: User # Reference to User
    comments: [Comment]
    createdAt: String
  }

  # Input types for mutations
  input CreateFilmSimInput {
    name: String!
    description: String
    settings: FilmSimSettingsInput!
    tagIds: [ID!]
  }

  # Extend the root Query type
  extend type Query {
    getFilmSim(slug: String!): FilmSim
    listFilmSims(filter: JSON): [FilmSim]
  }

  # Extend the root Mutation type
  extend type Mutation {
    uploadFilmSim(
      name: String!
      description: String
      settings: FilmSimSettingsInput!
      tags: [String!]!
    ): FilmSim!

    deleteFilmSim(id: ID!): Boolean
  }
`;
```

**Key Concepts:**

- **Types**: Define the structure of objects (FilmSim, User, etc.)
- **Input Types**: Used for mutations, define what data clients can send
- **Scalars**: Basic types like String, Int, Boolean, ID
- **Arrays**: `[Tag]` means array of Tag objects
- **Required Fields**: `String!` means required, `String` means optional
- **Extensions**: `extend type Query` adds fields to the root Query type

### 3. Resolvers (`server/schema/resolvers/filmSim.js`)

Resolvers contain the actual business logic:

```javascript
const filmSimResolvers = {
  // Query resolvers - for fetching data
  Query: {
    getFilmSim: async (_, { slug }, { user }) => {
      // _ = parent (not used here)
      // { slug } = arguments from the query
      // { user } = context (from authentication)

      const filmSim = await populateFilmSim(FilmSim.findOne({ slug }));

      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      return filmSim;
    },

    listFilmSims: async (_, { filter }, { user }) => {
      return await populateFilmSim(FilmSim.find(filter || {}));
    },
  },

  // Mutation resolvers - for modifying data
  Mutation: {
    uploadFilmSim: async (_, args, { user }) => {
      // Check authentication
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to upload a film simulation"
        );
      }

      // Extract arguments
      const { name, description, tags, settings, notes } = args;

      // Process tags
      const tagIds = await Promise.all(
        tags.map(async (tagName) => {
          const existingTag = await Tag.findOneAndUpdate(
            { name: tagName.toLowerCase() },
            { name: tagName.toLowerCase(), displayName: tagName },
            { new: true, upsert: true }
          );
          return existingTag._id;
        })
      );

      // Create the film simulation
      const filmSim = await FilmSim.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        settings,
        tags: tagIds,
        creator: user._id,
      });

      return filmSim;
    },

    deleteFilmSim: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      const filmSim = await FilmSim.findById(id);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      // Check ownership
      if (filmSim.creator.toString() !== user._id.toString()) {
        throw new AuthenticationError("Not authorized");
      }

      await FilmSim.findByIdAndDelete(id);
      return true;
    },
  },
};
```

**Key Concepts:**

- **Resolver Function Signature**: `(parent, args, context, info) => result`
- **Authentication**: Check `context.user` for logged-in users
- **Authorization**: Verify user permissions before operations
- **Database Operations**: Use Mongoose models to interact with MongoDB
- **Error Handling**: Throw specific errors that GraphQL can handle
- **Population**: Use `populateFilmSim` to fetch related data

### 4. Database Population Helper

Notice the `populateFilmSim` function - this is crucial for fetching related data:

```javascript
const populateFilmSim = (query) => {
  return query
    .populate({
      path: "creator",
      select: "username avatar instagram",
    })
    .populate({
      path: "tags",
      select: "name displayName",
    })
    .populate({
      path: "sampleImages",
      select: "url caption",
    })
    .populate({
      path: "comments.user",
      select: "username avatar",
    });
};
```

This tells MongoDB to replace ObjectIds with actual objects from other collections.

---

## Client-Side Implementation

### 1. Apollo Client Setup (`client/src/graphql/apolloClient.ts`)

The client is configured to handle authentication and error management:

```typescript
import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Create HTTP link to GraphQL endpoint
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || "http://localhost:4000/graphql",
  credentials: "include",
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // Handle specific error types
      if (message.includes("jwt expired")) {
        localStorage.removeItem("visor_token");
        window.location.href = "/login";
      }
      console.error(`[GraphQL error]: ${message}`);
    });
  }
});

// Authentication link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("visor_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]), // Order matters!
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only", // Always fetch fresh data
    },
  },
});
```

**Key Concepts:**

- **Links**: Chain of operations that process requests/responses
- **Authentication**: Automatically adds JWT token to requests
- **Error Handling**: Gracefully handles authentication failures
- **Cache Policy**: `network-only` ensures fresh data

### 2. GraphQL Queries (`client/src/graphql/queries/getAllFilmSims.ts`)

Define reusable queries:

```typescript
import { gql } from "@apollo/client";

export const GET_ALL_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims {
      id
      name
      slug
      description
      notes
      tags {
        id
        displayName
      }
      creator {
        id
        username
        avatar
      }
      sampleImages {
        url
      }
    }
  }
`;
```

### 3. GraphQL Fragments (`client/src/graphql/fragments/filmSimFields.graphql`)

Fragments allow you to reuse field sets:

```graphql
fragment FilmSimFields on FilmSim {
  id
  name
  slug
  description
  type
  creator {
    id
    username
    avatar
  }
  tags {
    id
    displayName
  }
  sampleImages {
    id
    url
    caption
  }
  likes {
    id
  }
}
```

Then use fragments in queries:

```graphql
query GetFilmSim($slug: String!) {
  getFilmSim(slug: $slug) {
    ...FilmSimFields
    settings {
      dynamicRange
      highlight
      shadow
    }
    comments {
      text
      user {
        username
      }
    }
  }
}
```

### 4. Using Queries in React Components

Here's how we use GraphQL in React components:

```typescript
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

const FilmSimList: React.FC = () => {
  // useQuery hook for fetching data
  const { loading, error, data, refetch } = useQuery(GET_ALL_FILMSIMS, {
    variables: {
      // Query variables go here
    },
    onError: (error) => {
      console.error("Failed to fetch film sims:", error);
    },
  });

  // useMutation hook for modifying data
  const [deleteFilmSim] = useMutation(DELETE_FILM_SIM, {
    onCompleted: () => {
      // Refetch data after successful mutation
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete film sim:", error);
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const filmSims = data?.listFilmSims || [];

  return (
    <div>
      {filmSims.map((filmSim) => (
        <FilmSimCard
          key={filmSim.id}
          filmSim={filmSim}
          onDelete={() => deleteFilmSim({ variables: { id: filmSim.id } })}
        />
      ))}
    </div>
  );
};
```

**Key Concepts:**

- **useQuery**: Hook for fetching data, returns loading/error/data states
- **useMutation**: Hook for modifying data, returns mutation function
- **Variables**: Pass parameters to queries/mutations
- **Refetch**: Manually trigger query again
- **Optimistic Updates**: Update UI immediately, rollback on error

---

## Real-World Examples

### Example 1: Fetching Film Simulations with Related Data

**Server Query:**

```graphql
query ListFilmSims {
  listFilmSims {
    id
    name
    slug
    description
    creator {
      username
      avatar
    }
    tags {
      displayName
    }
    sampleImages {
      url
    }
  }
}
```

**What happens on the server:**

1. `listFilmSims` resolver is called
2. MongoDB query finds all FilmSim documents
3. `populateFilmSim` function populates related data:
   - Fetches User data for `creator` field
   - Fetches Tag data for `tags` field
   - Fetches Image data for `sampleImages` field
4. Returns complete object with all related data

**Client receives:**

```javascript
{
  "listFilmSims": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Kodak Portra 400",
      "slug": "kodak-portra-400",
      "description": "Warm, film-like colors",
      "creator": {
        "username": "john_photographer",
        "avatar": "https://cloudinary.com/avatar.jpg"
      },
      "tags": [
        { "displayName": "Film Simulation" },
        { "displayName": "Portrait" }
      ],
      "sampleImages": [
        { "url": "https://cloudinary.com/sample1.jpg" }
      ]
    }
  ]
}
```

### Example 2: Creating a Film Simulation

**Client Mutation:**

```typescript
const [uploadFilmSim] = useMutation(UPLOAD_FILM_SIM);

const handleUpload = async () => {
  try {
    const result = await uploadFilmSim({
      variables: {
        name: "My Custom Film Sim",
        description: "A custom film simulation",
        settings: {
          dynamicRange: 100,
          highlight: -1,
          shadow: 1,
          colour: 0,
          // ... other settings
        },
        tags: ["Custom", "Portrait"],
        sampleImages: [
          {
            url: "https://cloudinary.com/image.jpg",
            publicId: "image_id",
          },
        ],
      },
    });

    console.log("Created:", result.data.uploadFilmSim);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

**What happens on the server:**

1. `uploadFilmSim` resolver receives the arguments
2. Checks if user is authenticated
3. Processes tags (creates new ones if needed)
4. Creates slug from name
5. Creates FilmSim document in MongoDB
6. Creates Image documents for sample images
7. Creates Discussion for the film sim
8. Returns the created FilmSim with populated data

### Example 3: Adding Comments to Film Simulations

**Server Mutation:**

```javascript
addComment: async (_, { filmSimId, text }, { user }) => {
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }

  const filmSim = await FilmSim.findById(filmSimId);
  if (!filmSim) {
    throw new Error("Film simulation not found");
  }

  // Add comment to embedded comments array
  const comment = {
    text,
    user: user._id,
    createdAt: new Date(),
  };

  filmSim.comments.push(comment);
  await filmSim.save();

  // Return populated comment
  const populatedFilmSim = await FilmSim.findById(filmSimId).populate({
    path: "comments.user",
    select: "username avatar",
  });

  return populatedFilmSim.comments[populatedFilmSim.comments.length - 1];
};
```

**Client Usage:**

```typescript
const [addComment] = useMutation(ADD_COMMENT, {
  refetchQueries: [GET_FILM_SIM_BY_SLUG], // Refetch to show new comment
});

const handleAddComment = async (text: string) => {
  await addComment({
    variables: {
      filmSimId: filmSim.id,
      text: text,
    },
  });
};
```

---

## Error Handling & Best Practices

### 1. Server-Side Error Handling

```javascript
// Custom error types
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");

// In resolvers
if (!user) {
  throw new AuthenticationError("You must be logged in");
}

if (!filmSim) {
  throw new Error("Film simulation not found");
}

if (filmSim.creator.toString() !== user._id.toString()) {
  throw new AuthenticationError(
    "Not authorized to modify this film simulation"
  );
}
```

### 2. Client-Side Error Handling

```typescript
const { loading, error, data } = useQuery(GET_FILMSIMS, {
  onError: (error) => {
    // Handle specific error types
    if (error.message.includes("Not authenticated")) {
      // Redirect to login
      navigate("/login");
    } else if (error.message.includes("Not authorized")) {
      // Show permission error
      setError("You don't have permission to view this content");
    }
  },
});

const [deleteFilmSim] = useMutation(DELETE_FILM_SIM, {
  onCompleted: () => {
    // Success handling
    showSuccess("Film simulation deleted successfully");
    refetch();
  },
  onError: (error) => {
    // Error handling
    showError(`Failed to delete: ${error.message}`);
  },
});
```

### 3. Optimistic Updates

```typescript
const [likeFilmSim] = useMutation(LIKE_FILM_SIM, {
  optimisticResponse: {
    likeFilmSim: true,
  },
  update: (cache, { data }) => {
    // Update cache immediately
    const existingFilmSim = cache.readQuery({
      query: GET_FILM_SIM,
      variables: { slug: filmSimSlug },
    });

    cache.writeQuery({
      query: GET_FILM_SIM,
      variables: { slug: filmSimSlug },
      data: {
        getFilmSim: {
          ...existingFilmSim.getFilmSim,
          likes: [...existingFilmSim.getFilmSim.likes, { id: user.id }],
        },
      },
    });
  },
});
```

---

## Testing with Cypress

Since this project uses Cypress for testing [[memory:2459659]], here's how to test GraphQL operations:

### Testing GraphQL Queries in Cypress

```typescript
// cypress/e2e/filmsim-upload.cy.ts
describe("Film Simulation Upload", () => {
  it("should upload a film simulation successfully", () => {
    // Mock GraphQL response
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body.query.includes("uploadFilmSim")) {
        req.reply({
          data: {
            uploadFilmSim: {
              id: "123",
              name: "Test Film Sim",
              slug: "test-film-sim",
              // ... other fields
            },
          },
        });
      }
    });

    cy.visit("/upload-filmsim");

    // Fill form
    cy.get("[data-cy=film-sim-name]").type("Test Film Sim");
    cy.get("[data-cy=film-sim-description]").type("Test description");

    // Submit form
    cy.get("[data-cy=submit-button]").click();

    // Verify success
    cy.contains("Film simulation uploaded successfully").should("be.visible");
  });
});
```

### Testing Error Scenarios

```typescript
it("should handle upload errors gracefully", () => {
  cy.intercept("POST", "**/graphql", {
    statusCode: 200,
    body: {
      errors: [
        {
          message: "You must be logged in to upload a film simulation",
          extensions: { code: "UNAUTHENTICATED" },
        },
      ],
    },
  });

  cy.visit("/upload-filmsim");
  cy.get("[data-cy=submit-button]").click();
  cy.contains("You must be logged in").should("be.visible");
});
```

---

## Common Patterns & Tips

### 1. Data Loading Patterns

```typescript
// Pattern 1: Loading states
const { loading, error, data } = useQuery(GET_FILMSIMS);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <FilmSimList filmSims={data.listFilmSims} />;

// Pattern 2: Conditional queries
const { data: userData } = useQuery(GET_USER_LISTS, {
  variables: { userId: user?.id },
  skip: !user?.id, // Only run query if user exists
});

// Pattern 3: Refetching after mutations
const [deleteFilmSim] = useMutation(DELETE_FILM_SIM, {
  refetchQueries: [GET_ALL_FILMSIMS], // Automatically refetch
});
```

### 2. Cache Management

```typescript
// Update cache after mutation
const [updateFilmSim] = useMutation(UPDATE_FILM_SIM, {
  update: (cache, { data }) => {
    cache.modify({
      id: cache.identify(data.updateFilmSim),
      fields: {
        name: () => data.updateFilmSim.name,
        description: () => data.updateFilmSim.description,
      },
    });
  },
});
```

### 3. Variable Management

```typescript
// Use reactive variables for dynamic queries
const [searchTerm, setSearchTerm] = useState("");

const { data } = useQuery(SEARCH_FILMSIMS, {
  variables: { query: searchTerm },
  skip: searchTerm.length < 2, // Don't search until 2+ characters
});

// Debounced search
useEffect(() => {
  const timer = setTimeout(() => {
    setSearchTerm(debouncedValue);
  }, 300);
  return () => clearTimeout(timer);
}, [debouncedValue]);
```

### 4. Type Safety with TypeScript

```typescript
// Define types for GraphQL responses
interface FilmSim {
  id: string;
  name: string;
  slug: string;
  description?: string;
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  tags: Array<{
    id: string;
    displayName: string;
  }>;
}

// Use with queries
const { data } = useQuery<{ listFilmSims: FilmSim[] }>(GET_ALL_FILMSIMS);
```

### 5. Performance Optimization

```typescript
// Use fragments to reduce duplication
const FILM_SIM_FRAGMENT = gql`
  fragment FilmSimFields on FilmSim {
    id
    name
    slug
    creator {
      username
    }
  }
`;

// Use fragments in queries
const GET_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims {
      ...FilmSimFields
    }
  }
  ${FILM_SIM_FRAGMENT}
`;

// Pagination for large datasets
const GET_FILMSIMS_PAGINATED = gql`
  query ListFilmSims($page: Int!, $limit: Int!) {
    listFilmSims(page: $page, limit: $limit) {
      data {
        ...FilmSimFields
      }
      totalCount
      hasNextPage
    }
  }
`;
```

---

## Summary

GraphQL in VISOR provides:

1. **Efficient Data Fetching**: Single requests for complex, related data
2. **Type Safety**: Strong typing prevents runtime errors
3. **Real-time Features**: Subscriptions for discussions and notifications
4. **Developer Experience**: Apollo DevTools, auto-completion, error handling
5. **Flexibility**: Frontend can request exactly what it needs

The key to mastering GraphQL in this codebase is understanding:

- How schemas define your API contract
- How resolvers implement business logic
- How the client manages state and caching
- How to handle authentication and authorization
- How to test GraphQL operations effectively

Remember: GraphQL is not just about fetching data efficiently—it's about creating a robust, type-safe API that scales with your application's complexity.
