# Architecture Refactor Summary

## Overview

This refactor introduces a **plugin architecture** to the VISOR frontend, enabling extensibility without modifying core code. The architecture is based on **Slots** (UI injection points) and **Events** (pub/sub communication).

## What Was Changed

### 1. Core Infrastructure Created

- **`lib/slots/create-slot.ts`** - Core slot system with `.plug()`, `.usePlug()`, and `.Slot` component
- **`lib/slots/slot-definitions.ts`** - All available slots organized by feature area
- **`lib/events/create-event.ts`** - Core event system with `.raise()`, `.handle()`, and `.useEvent()`
- **`lib/events/event-definitions.ts`** - All available events organized by feature area
- **`lib/plugins/scanner.ts`** - Auto-discovery system for runtime files

### 2. Components Refactored

#### Home Page (`pages/Home.tsx`)
- Refactored to use `HomePageHero`, `HomePageTile`, and `HomePageFeaturedSection` slots
- Default content moved to `pages/plugins/home-page-defaults.runtime.tsx`

#### FilmSimCard (`components/cards/FilmSimCard.tsx`)
- Refactored to use `FilmSimCardOverlay` and `FilmSimCardFooter` slots
- Default "Add to List" button moved to `components/cards/plugins/filmsim-card-defaults.runtime.tsx`

#### FilmSimDetail (`pages/FilmSimDetail.tsx`)
- Refactored to use `FilmSimDetailToolbar` and `FilmSimDetailSection` slots
- All default sections moved to `pages/plugins/filmsim-detail-defaults.runtime.tsx`

### 3. Auto-Discovery Setup

- Updated `main.tsx` to scan and load all runtime files on app startup
- Uses Vite's `import.meta.glob` for automatic file discovery

## Architecture Principles

### Open/Closed Principle
- Core code is **closed for modification** but **open for extension**
- New features added via plugins without touching core code

### Convention Over Configuration
- Runtime files (`*.runtime.tsx`) are automatically discovered
- No manual registration needed

### Separation of Concerns
- Slots handle UI composition
- Events handle communication
- Plugins are isolated and testable

## How to Use

### Adding a Plugin

1. Create a `.runtime.tsx` file anywhere in `src/`
2. Import the slot you want to plug into
3. Call `.plug()` with your component:

```typescript
// my-plugin.runtime.tsx
import { HomePageTile } from "../../lib/slots/slot-definitions";
import { MyWidget } from "./MyWidget";

HomePageTile.plug(<MyWidget />, 50);
```

### Using Events

```typescript
// Raise an event
import { ContentRefresh } from "../lib/events/event-definitions";
ContentRefresh.raise();

// Listen to an event
ContentRefresh.useEvent(() => {
  // Handle refresh
}, []);
```

## Available Slots

### Home Page
- `HomePageHero` - Hero section
- `HomePageTile` - Widget tiles
- `HomePageFeaturedSection` - Featured sections

### Cards
- `FilmSimCardOverlay` - Overlay actions
- `FilmSimCardFooter` - Footer content
- `PresetCardOverlay` - Preset card actions
- `PresetCardFooter` - Preset card footer
- `ListCardOverlay` - List card actions
- `ListCardFooter` - List card footer

### Detail Pages
- `FilmSimDetailToolbar` - FilmSim detail toolbar
- `FilmSimDetailSection` - FilmSim detail sections
- `PresetDetailToolbar` - Preset detail toolbar
- `PresetDetailSection` - Preset detail sections

### Navigation
- `NavbarLeft` - Navbar left side
- `NavbarRight` - Navbar right side
- `NavbarCenter` - Navbar center

See `lib/slots/slot-definitions.ts` for complete list.

## Available Events

### Content Events
- `FilmSimChanged` - FilmSim created/updated/deleted
- `PresetChanged` - Preset created/updated/deleted
- `ListChanged` - List created/updated/deleted
- `ContentRefresh` - Content needs refresh

### User Events
- `UserLoggedIn` - User logged in
- `UserLoggedOut` - User logged out
- `UserProfileUpdated` - Profile updated

See `lib/events/event-definitions.ts` for complete list.

## Priority System

Plugins are rendered in priority order:
- **1-50**: Early items (headers, primary actions)
- **51-100**: Default items (main content)
- **101+**: Late items (footers, secondary actions)

## Next Steps

1. **Refactor remaining pages** - Apply slots to PresetDetail, DiscussionDetail, etc.
2. **Refactor remaining cards** - Apply slots to PresetCard, ListCard, etc.
3. **Add more events** - Identify communication patterns and add events
4. **Create example plugins** - Demonstrate the architecture with real use cases
5. **Documentation** - Expand plugin documentation with examples

## Benefits

✅ **Extensibility** - Add features without modifying core code  
✅ **Maintainability** - Clear separation of concerns  
✅ **Testability** - Plugins are isolated and testable  
✅ **Scalability** - Multiple developers can work without conflicts  
✅ **Flexibility** - Enable/disable features via plugins  

## Migration Notes

- All existing functionality preserved
- Default content moved to runtime files
- No breaking changes to existing components
- Backward compatible with existing code

