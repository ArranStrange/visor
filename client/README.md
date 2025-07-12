# VISOR 📸

**A platform to share Lightroom presets, film simulations, and photographic inspiration.**

VISOR is a modern web application that connects photographers through the sharing of Lightroom presets and Fujifilm film simulation recipes. Built with React, TypeScript, and GraphQL, it provides a beautiful, responsive interface for discovering, sharing, and discussing photographic styles.

## ✨ Features

### 🎨 Content Management

- **Lightroom Presets**: Upload and share .xmp preset files with before/after comparisons
- **Film Simulations**: Create and share Fujifilm camera recipes with detailed settings
- **Image Galleries**: Showcase your work with multiple sample images per preset/film sim
- **Tag System**: Organize content with customizable tags (portrait, landscape, vintage, etc.)

### 🔍 Discovery & Search

- **Advanced Search**: Find presets and film sims by title, description, tags, or creator
- **Content Filtering**: Filter by presets, film simulations, or view all content
- **Responsive Grid**: Beautiful masonry layout that adapts to any screen size
- **Infinite Scroll**: Seamless loading of content as you browse

### 👥 Community Features

- **User Profiles**: Public profiles showcasing user's presets and film sims
- **Lists**: Create and share curated collections of your favorite content
- **Discussions**: Community forum for asking questions, sharing techniques, and getting feedback
- **Comments & Reactions**: Engage with content through comments and emoji reactions
- **Follow System**: Follow other creators and stay updated with their latest work

### 📱 Modern UX

- **Dark Theme**: Beautiful dark interface optimized for photo viewing
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Progressive Loading**: Optimized image loading with Cloudinary integration
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

### 🔧 Technical Features

- **GraphQL API**: Modern API with Apollo Client for efficient data fetching
- **Real-time Updates**: Live notifications and content updates
- **File Upload**: Drag-and-drop file uploads with progress tracking
- **Authentication**: Secure JWT-based authentication system
- **Performance Optimized**: Lazy loading, image optimization, and efficient caching

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database
- Cloudinary account (for image hosting)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd visor-client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_GRAPHQL_URL=http://localhost:4000/graphql
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Run tests**

   ```bash
   # Run all E2E tests
   npm run test:e2e

   # Open Cypress Test Runner
   npm run test:e2e:open
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Navigation and layout components
│   ├── discussions/    # Community discussion components
│   └── ...            # Other component categories
├── pages/              # Page components
├── graphql/            # GraphQL queries, mutations, and client setup
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── theme/              # Material-UI theme configuration

cypress/                # End-to-end tests
├── e2e/               # Test files
├── fixtures/          # Test data
└── support/           # Custom commands and configuration

docs/                   # Comprehensive documentation
├── README.md          # Documentation overview
├── Home.md            # Home page documentation
├── Login.md           # Login page documentation
└── ...                # All page documentation files
```

## 🧪 Testing

VISOR includes comprehensive end-to-end testing with Cypress:

- **Navigation Tests**: Page routing and responsive navigation
- **Search Tests**: Content discovery and filtering functionality
- **Upload Tests**: File upload and form validation
- **Content Tests**: Preset and film sim detail pages
- **User Tests**: Authentication and profile functionality

Run tests with:

```bash
npm run test:e2e          # Run all tests
npm run test:e2e:open     # Open Cypress GUI
npm run test:e2e:headed   # Run with browser visible
```

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build:prod
npm run deploy
```

### Environment Variables for Production

- `VITE_GRAPHQL_URL`: Your production GraphQL endpoint
- `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Material-UI** - Beautiful, accessible component library
- **Apollo Client** - GraphQL client with caching
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions

### Testing

- **Cypress** - End-to-end testing framework
- **Custom Commands** - Reusable test utilities

### Build Tools

- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

### External Services

- **Cloudinary** - Image optimization and hosting
- **Firebase Hosting** - Static site hosting
- **GraphQL API** - Backend data layer

## 📊 Performance Optimizations

VISOR includes several performance optimizations:

- **Image Optimization**: Cloudinary integration with automatic format selection
- **Lazy Loading**: Images and components load only when needed
- **Infinite Scroll**: Efficient content loading with virtualization
- **Caching**: Apollo Client cache for GraphQL queries
- **Bundle Optimization**: Code splitting and tree shaking

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Overview](./docs/README.md)** - Complete guide to all documentation
- **[Page Documentation](./docs/)** - Detailed documentation for each application page
- **[Performance Guidelines](./docs/PERFORMANCE_OPTIMIZATIONS.md)** - Performance optimization strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Fujifilm** - For inspiring the film simulation features
- **Adobe** - For the Lightroom preset format
- **Material-UI** - For the beautiful component library
- **Cloudinary** - For image optimization services

---
