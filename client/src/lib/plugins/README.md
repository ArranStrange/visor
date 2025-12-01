# Plugin Architecture

This codebase uses a plugin architecture based on **Slots** and **Events** to enable extensibility without modifying core code.

## Core Concepts

### Slots
Slots are placeholders in the UI where plugins can inject components. Think of them as "plug sockets" - the core code provides the socket, and plugins provide the plugs.

### Events
Events provide pub/sub communication between components without direct dependencies.

## File Structure

```
src/
  lib/
    slots/
      create-slot.ts          # Core slot system
      slot-definitions.ts      # All available slots
    events/
      create-event.ts         # Core event system
      event-definitions.ts    # All available events
    plugins/
      scanner.ts              # Auto-discovery of runtime files
  pages/
    plugins/                  # Page-specific plugins
      *.runtime.tsx
  components/
    cards/
      plugins/                # Card-specific plugins
        *.runtime.tsx
```

## Creating a Plugin

### 1. Create a Runtime File

Create a file ending in `.runtime.tsx` or `.runtime.ts`:

```typescript
// my-feature.runtime.tsx
import { HomePageTile } from "../../lib/slots/slot-definitions";
import { MyWidget } from "./MyWidget";

// Register at module load time
HomePageTile.plug(<MyWidget />, 50); // Priority 50
```

### 2. Use Slots in Components

```typescript
import { HomePageTile } from "../lib/slots/slot-definitions";

function HomePage() {
  return (
    <Box>
      <HomePageTile.Slot />
    </Box>
  );
}
```

### 3. Use Events for Communication

```typescript
import { ContentRefresh } from "../lib/events/event-definitions";

function MyComponent() {
  const handleSave = () => {
    // Save data...
    ContentRefresh.raise(); // Notify all listeners
  };
}

function AnotherComponent() {
  const refresh = ContentRefresh.useRefresh();
  return <div key={refresh.id}>...</div>;
}
```

## Priority System

Plugins are rendered in priority order (lower = first):
- Priority 1-50: Early items
- Priority 51-100: Default items
- Priority 101+: Late items

## Conditional Rendering

Use the `if` prop for conditional plugins:

```typescript
MySlot.plug(
  <MyComponent if={(context) => context.user?.isAdmin} />,
  10
);
```

## Best Practices

1. **Use `.plug()` for static plugins** (module-level registration)
2. **Use `.usePlug()` for dynamic plugins** (component lifecycle)
3. **Keep priorities consistent** - document priority ranges
4. **Use events for communication** - avoid direct component dependencies
5. **One plugin per file** - keep plugins focused and testable

## Auto-Discovery

Runtime files are automatically discovered and loaded on app startup via `main.tsx`. No manual registration needed!

