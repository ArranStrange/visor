# Directory Structure (SFG20 Pattern)

This document describes the directory structure following SFG20 conventions.

## Overview

The codebase is organized into **routes** (self-contained feature areas) and **plugins** (global extensions), following the SFG20 pattern.

## Directory Structure

```
client/src/
├── routes/                    # Route-based features (SFG20 pattern)
│   ├── home/                  # Home page route
│   │   ├── home-route.tsx     # Route component
│   │   └── home.runtime.tsx   # Route-specific plugins
│   ├── search/                # Search route
│   │   └── search-route.tsx
│   ├── preset/                # Preset detail route
│   │   └── preset-detail-route.tsx
│   ├── filmsim/               # FilmSim detail route
│   │   ├── filmsim-detail-route.tsx
│   │   └── filmsim-detail.runtime.tsx
│   ├── profile/               # Profile routes
│   │   ├── profile-route.tsx
│   │   └── public-profile-route.tsx
│   ├── upload/                # Upload routes
│   │   ├── upload-route.tsx
│   │   ├── upload-preset-route.tsx
│   │   └── upload-filmsim-route.tsx
│   ├── auth/                  # Authentication routes
│   │   ├── login-route.tsx
│   │   ├── register-route.tsx
│   │   └── email-verification-route.tsx
│   ├── discussions/           # Discussion routes
│   │   ├── discussions-route.tsx
│   │   ├── discussion-detail-route.tsx
│   │   └── create-discussion-route.tsx
│   └── lists/                 # List routes
│       ├── my-lists-route.tsx
│       ├── browse-lists-route.tsx
│       ├── list-detail-route.tsx
│       └── create-list-route.tsx
│
├── plugins/                   # Global plugins (SFG20 pattern)
│   ├── cards/                 # Card plugins
│   │   └── filmsim-card-defaults.runtime.tsx
│   └── home/                  # Home page plugins
│       └── home-page-defaults.runtime.tsx
│
├── lib/                       # Core libraries
│   ├── slots/                 # Slot system
│   │   ├── create-slot.tsx
│   │   └── slot-definitions.ts
│   ├── events/                # Event system
│   │   ├── create-event.ts
│   │   └── event-definitions.ts
│   └── plugins/               # Plugin utilities
│       ├── scanner.ts
│       └── README.md
│
├── components/                # Shared components
│   ├── cards/                 # Card components
│   ├── dialogs/               # Dialog components
│   ├── discussions/           # Discussion components
│   ├── filmsims/              # FilmSim components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   ├── lists/                 # List components
│   ├── media/                 # Media components
│   ├── presets/               # Preset components
│   ├── settings/              # Settings components
│   └── ui/                    # UI components
│
├── hooks/                     # React hooks
├── graphql/                   # GraphQL queries/mutations
├── context/                   # React contexts
├── utils/                     # Utility functions
├── types/                     # TypeScript types
├── config/                    # Configuration
├── theme/                     # Theme configuration
└── styles/                    # Styles
```

## Route Structure

Each route is **self-contained** and can include:

- **Route component** (`*-route.tsx`) - The main page component
- **Runtime plugins** (`*.runtime.tsx`) - Route-specific plugins
- **Components** (`components/`) - Route-specific components (optional)
- **Hooks** (`hooks/`) - Route-specific hooks (optional)

### Example: Home Route

```
routes/home/
├── home-route.tsx          # Main route component
└── home.runtime.tsx        # Route plugins (registers default content)
```

## Plugin File Naming

Following SFG20 conventions:

- **`*.runtime.tsx`** - Runtime plugins (loaded when routes become active)
- **`startup-main.tsx`** - Startup plugins (loaded at app startup)
- **`*.app.tsx`** - App-level configuration
- **`*.lazy.tsx`** - Lazy-loaded plugins

## Path Aliases

SFG20-style path aliases are configured in `vite.config.ts` and `tsconfig.json`:

- `lib/*` → `src/lib/*`
- `routes/*` → `src/routes/*`
- `plugins/*` → `src/plugins/*`
- `components/*` → `src/components/*`
- `hooks/*` → `src/hooks/*`
- `graphql/*` → `src/graphql/*`
- `context/*` → `src/context/*`
- `utils/*` → `src/utils/*`
- `types/*` → `src/types/*`
- `config/*` → `src/config/*`

## Import Examples

```typescript
// Using path aliases
import { HomePageTile } from "lib/slots/slot-definitions";
import HomeRoute from "routes/home/home-route";
import { FilmSimCard } from "components/cards/FilmSimCard";
import { useAuth } from "context/AuthContext";
```

## Benefits

✅ **Self-contained routes** - Each route is independent  
✅ **Plugin-based** - Extensible without modifying core code  
✅ **Clear organization** - Easy to find and understand code  
✅ **SFG20 compatibility** - Follows proven patterns  
✅ **Path aliases** - Clean imports without relative paths  

