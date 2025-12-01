# Study: The Plugin Environment of Visor

## 1. Orientation: Why This Matters Here

- **Extensibility without modification**: You can add features to cards, pages, and components without editing the core component files. This means multiple developers can work on different features without conflicts.
- **What can break**: If you don't understand slots, you might try to modify core components directly, causing merge conflicts and breaking other plugins. If you don't understand events, components won't communicate properly.
- **Day-to-day work**: You'll use this when:
  - Adding a new button to a card (like "Add to List")
  - Adding sections to detail pages
  - Creating new features that need to appear in specific places
  - Making components communicate without prop drilling
  - Building features that should be optional/conditional

---

## 2. Concept Primer (Simple English)

### What is a Plugin System?

Think of it like **power outlets in your house**:

- The **outlet** (Slot) is built into the wall (core component)
- You can **plug in** different devices (plugins) without rewiring the house
- Multiple devices can use the same outlet (multiple plugins per slot)
- Devices can be plugged in in a specific order (priority system)

### Two Main Concepts: Slots and Events

**Slots = Where to Render**

- A **Slot** is a placeholder in a component where plugins can inject content
- Like a "hole" in the UI that gets filled by plugins
- Example: `FilmSimCard` has a slot for overlay buttons - plugins can add buttons there

**Events = How to Communicate**

- An **Event** is a message that components can send and listen to
- Like a radio broadcast - one component "raises" an event, others "listen"
- Example: When a FilmSim is saved, raise `FilmSimChanged` event, and all components listening refresh

### The Technology Stack

- **React**: Components are React components
- **Vite**: Uses `import.meta.glob` to automatically find plugin files
- **TypeScript**: Type-safe plugin definitions
- **Module-level execution**: Runtime files execute when imported (not when rendered)

### Common Confusions

1. **"Do I modify the core component?"** → No! Use slots instead
2. **"How do components talk?"** → Use events, not props
3. **"When does my plugin run?"** → At module load time (when app starts)
4. **"Why isn't my plugin showing?"** → Check priority, check slot name, check runtime file is loaded

---

## 3. Simple Standalone Example

Let's build a minimal example from scratch:

### Step 1: Create a Slot

See how slots are defined in the codebase:

```27:28:client/src/lib/slots/slot-definitions.ts
/** FilmSim card overlay actions (buttons, icons) */
export const FilmSimCardOverlay = createSlot("FilmSimCardOverlay");
```

The `createSlot` function implementation:

```96:100:client/src/lib/slots/create-slot.tsx
export function createSlot(name: string): SlotObject {
  // Return existing slot if already created
  if (slotCache.has(name)) {
    return slotCache.get(name)!;
  }
```

### Step 2: Use the Slot in a Component

See how `FilmSimCard` uses the slot:

```123:128:client/src/components/cards/FilmSimCard.tsx
        {/* Overlay actions - plugins can inject buttons/actions here */}
        <FilmSimCardOverlay.Slot
          id={id}
          name={name}
          slug={slug}
          onAddToList={handleAddToList}
        />
```

### Step 3: Create a Plugin

See the actual runtime file that registers the "Add to List" button:

```13:16:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx
// Register default "Add to List" button
FilmSimCardOverlay.plug(
  <AddToListButton key="add-to-list-button" />,
  10
);
```

And the plugin component itself:

```6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx
export function AddToListButton({
  id: _id,
  name: _name,
  onAddToList,
}: {
  id: string;
  name: string;
  onAddToList?: (e: React.MouseEvent) => void;
}) {
  return (
    <Box className="add-to-list-button" sx={overlayButtonStyles}>
      <IconButton
        className="floating"
        onClick={onAddToList}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
```

### Step 4: Auto-Discovery

See how the scanner is called in `main.tsx`:

```12:21:client/src/main.tsx
// Scan and load all runtime plugin files
scanRuntimeFiles().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  );
});
```

The scanner implementation that finds all runtime files:

```38:93:client/src/lib/plugins/scanner.ts
export async function scanRuntimeFiles(): Promise<void> {
  try {
    // Load app-level config first
    // Patterns are relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.app.{ts,tsx}" matches all app files
    const appModules = import.meta.glob(
      ["../../**/*.app.{ts,tsx}", "../../**/startup-main.{ts,tsx}"],
      { eager: true }
    );

    // Load runtime files (eager for now, can be lazy later)
    // Pattern is relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.runtime.{ts,tsx}" matches all runtime files
    const runtimeModules = import.meta.glob(["../../**/*.runtime.{ts,tsx}"], {
      eager: true,
    });

    // Track loaded files
    Object.keys(appModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        console.log(`Loaded app/startup file: ${path}`);
      }
    });

    Object.keys(runtimeModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        // Access the module to ensure it's executed
        // With eager: true, the module is already executed, but we access it to be sure
        const module = runtimeModules[path];
        if (module && typeof module === "object") {
          // Try to access default export or any exports to ensure execution
          try {
            // Accessing the module ensures side effects run
            if ("default" in module) {
              module.default;
            }
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(
          `✅ Loaded runtime file: ${path}`,
          Object.keys(module || {})
        );
      }
    });

    console.log(
      `📦 Total runtime files loaded: ${Object.keys(runtimeModules).length}`
    );
  } catch (error) {
    console.error("Error scanning runtime files:", error);
  }
}
```

**What Happens:**

1. App starts → `scanRuntimeFiles()` runs
2. Scanner finds `my-feature.runtime.tsx`
3. File executes → `MyButtonSlot.plug()` runs
4. Button is registered in the slot registry
5. `MyCard` renders → `<MyButtonSlot.Slot />` fetches registered items
6. Button appears in the card!

---

## 4. How This Shows Up in This Codebase

### Where It Lives

**Core System Files:**

- `1:260:client/src/lib/slots/create-slot.tsx` - Core slot implementation
- `1:148:client/src/lib/slots/slot-definitions.ts` - All available slots
- `1:120:client/src/lib/plugins/scanner.ts` - Auto-discovery system
- `1:247:client/src/lib/events/create-event.ts` - Event system
- `1:117:client/src/lib/events/event-definitions.ts` - All available events

**Example Plugin Path:**

- Runtime file: `1:18:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx`
- Component using slot: `123:128:client/src/components/cards/FilmSimCard.tsx`
- Plugin component: `6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx`

### Main Flow Step-by-Step

**Example: FilmSim Card "Add to List" Button**

1. **App Startup** (`main.tsx`):

   ```typescript
   scanRuntimeFiles().then(() => {
     // App renders after all plugins are loaded
   });
   ```

2. **Scanner Discovers Files** (`lib/plugins/scanner.ts`):

   ```typescript
   // Finds: src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx
   const runtimeModules = import.meta.glob(["../../**/*.runtime.{ts,tsx}"], {
     eager: true, // Executes immediately
   });
   ```

3. **Runtime File Executes** (`plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx`):

   ```typescript
   // This code runs immediately when file is imported
   FilmSimCardOverlay.plug(
     <AddToListButton key="add-to-list-button" />,
     10 // Priority 10 (renders first)
   );
   ```

   - Creates a unique ID for the button
   - Adds it to `slotRegistry` Map under "FilmSimCardOverlay"
   - Sorts by priority
   - Notifies all listeners (triggers React re-renders)

4. **Card Component Renders** (`components/cards/FilmSimCard.tsx`):

   ```typescript
   <FilmSimCardOverlay.Slot
     id={id}
     name={name}
     slug={slug}
     onAddToList={handleAddToList}
   />
   ```

5. **Slot Component Fetches Items** (`lib/slots/create-slot.tsx`):

   ```typescript
   Slot: ({ Container, children, ...props }) => {
     const items = slot.useItems(); // React hook with state
     // items = [{ component: <AddToListButton />, priority: 10, id: "..." }]

     // Renders all items with props
     return items.map((item) =>
       React.cloneElement(item.component, { ...props, key: item.id })
     );
   };
   ```

6. **Button Appears** - The `AddToListButton` component renders in the card overlay!

### Important Helpers / Utilities

**Slot Methods:**

- `MySlot.plug(component, priority)` - Register at module level (most common)
- `MySlot.usePlug(component, deps)` - Register in component lifecycle
- `MySlot.Slot` - React component that renders all plugins
- `MySlot.useItems()` - Get all registered items (React hook)

**Event Methods:**

- `MyEvent.raise(...args)` - Fire event immediately
- `MyEvent.useEvent(handler, deps)` - Listen in React component
- `MyEvent.useRefresh()` - Auto-refresh component when event fires

---

## 5. Architecture / Patterns Lens

### Key Boundaries

**1. Core vs. Plugins:**

- **Core**: Components define slots (outlets) but don't know what plugs in
- **Plugins**: Register components into slots without modifying core code
- **Boundary**: `slot-definitions.ts` is the contract between core and plugins

**2. Module Load Time vs. Render Time:**

- **Module Load**: Runtime files execute when imported (app startup)
- **Render Time**: Slot components fetch and render plugins during React render
- **Why**: Plugins must be registered before components render

**3. Registry Pattern:**

- **Slot Registry**: `Map<string, SlotItem[]>` stores all plugins by slot name
  - See definition: `16:16:client/src/lib/slots/create-slot.tsx`
- **Event Registry**: `Map<string, Set<EventHandler>>` stores all event handlers
  - See definition: `71:71:client/src/lib/events/create-event.ts`
- **Why**: Centralized storage allows multiple plugins per slot

### Patterns in Use

**1. Plugin Registration Pattern:**

```typescript
// Runtime file (executes at module load)
MySlot.plug(<MyComponent />, priority);
```

**2. Slot Rendering Pattern:**

```typescript
// Core component (defines where plugins appear)
<MySlot.Slot {...props} />
```

**3. Event Communication Pattern:**

```typescript
// Component A: Raise event
MyEvent.raise(data);

// Component B: Listen to event
MyEvent.useEvent(
  (data) => {
    // React to event
  },
  [deps]
);
```

### What Could Go Wrong

**If you modify core components:**

- Merge conflicts when multiple developers work on features
- Breaking changes affect all plugins
- Hard to test in isolation

**If you don't use slots:**

- Direct component modifications create tight coupling
- Can't have multiple plugins for the same feature
- Hard to enable/disable features conditionally

**If you don't use events:**

- Prop drilling through many components
- Components become tightly coupled
- Hard to add new features that need to react to changes

---

## 6. Glossary & Cheat Sheet (Project-Specific)

### Core Terms

- **Slot** → A placeholder where plugins can inject React components. See `1:148:client/src/lib/slots/slot-definitions.ts`
- **Plugin** → A React component registered into a slot. Example: `6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx`
- **Runtime File** → A file ending in `.runtime.tsx` that registers plugins. Example: `1:18:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx`
- **Event** → A pub/sub message system for component communication. See `1:117:client/src/lib/events/event-definitions.ts`

### Slot Methods

- `MySlot.plug(component, priority)` → Register component at module level. Use in `.runtime.tsx` files
  - Implementation: `105:130:client/src/lib/slots/create-slot.tsx`
- `MySlot.usePlug(component, deps)` → Register component in React lifecycle. Use in components
  - Implementation: `132:161:client/src/lib/slots/create-slot.tsx`
- `MySlot.Slot` → React component that renders all registered plugins
  - Implementation: `163:203:client/src/lib/slots/create-slot.tsx`
- `MySlot.useItems()` → React hook to get all registered items
  - Implementation: `205:250:client/src/lib/slots/create-slot.tsx`

### Event Methods

- `MyEvent.raise(...args)` → Fire event immediately
  - Implementation: `96:107:client/src/lib/events/create-event.ts`
- `MyEvent.raiseOnce(...args)` → Fire event once (debounced 20ms)
  - Implementation: `124:138:client/src/lib/events/create-event.ts`
- `MyEvent.useEvent(handler, deps)` → Listen in React component
  - Implementation: `178:183:client/src/lib/events/create-event.ts`
- `MyEvent.useRefresh()` → Auto-refresh component when event fires
  - Implementation: `185:192:client/src/lib/events/create-event.ts`

### File Paths

- Slot definitions: `1:148:client/src/lib/slots/slot-definitions.ts`
- Event definitions: `1:117:client/src/lib/events/event-definitions.ts`
- Scanner: `1:120:client/src/lib/plugins/scanner.ts`
- Example plugin runtime: `1:18:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx`
- Example plugin component: `6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx`
- Example component using slot: `123:128:client/src/components/cards/FilmSimCard.tsx`

### Priority Ranges

- **1-50**: Early items (renders first)
- **51-100**: Default items (middle)
- **101+**: Late items (renders last)

---

## 7. How to Work With This as a Junior Dev

### How to Read the Code

**To understand a feature:**

1. Find the core component (e.g., `FilmSimCard.tsx`)
2. Look for `<MySlot.Slot />` - this is where plugins appear
3. Find the slot definition in `slot-definitions.ts`
4. Search for `.plug()` calls to find all plugins
5. Read the plugin components to understand what they do

**Example: Understanding FilmSim Card Buttons**

1. Open `123:128:client/src/components/cards/FilmSimCard.tsx` - Find `<FilmSimCardOverlay.Slot />`
2. Check `27:28:client/src/lib/slots/slot-definitions.ts` for `FilmSimCardOverlay` definition
3. See `13:16:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx` - where `FilmSimCardOverlay.plug()` is called
4. Read `6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx` - the plugin component

### How to Add a New Plugin

**Step 1: Find or Create a Slot**

```typescript
// In slot-definitions.ts (if slot doesn't exist)
export const MyNewSlot = createSlot("MyNewSlot");
```

See example: `27:28:client/src/lib/slots/slot-definitions.ts`

**Step 2: Use Slot in Component**

```typescript
// In your component
import { MyNewSlot } from "lib/slots/slot-definitions";

function MyComponent() {
  return (
    <div>
      <MyNewSlot.Slot {...props} />
    </div>
  );
}
```

See example: `123:128:client/src/components/cards/FilmSimCard.tsx`

**Step 3: Create Plugin File**

```typescript
// plugins/my-feature/my-feature.runtime.tsx
import { MyNewSlot } from "lib/slots/slot-definitions";
import { MyPluginComponent } from "./my-plugin-component";

MyNewSlot.plug(<MyPluginComponent />, 50);
```

See example: `1:18:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx`

**Step 4: Create Plugin Component**

```typescript
// plugins/my-feature/my-plugin-component.tsx
export function MyPluginComponent({ prop1, prop2 }) {
  return <button>{prop1}</button>;
}
```

See example: `6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx`

**Step 5: Test**

- Restart dev server (runtime files load on startup)
- Check console for "✅ Loaded runtime file"
- Check console for "🔌 Plugged into slot"
- Verify component appears in UI

### How to Debug

**Plugin not showing?**

1. Check console for runtime file loading: `✅ Loaded runtime file: ...`
2. Check console for plug registration: `🔌 Plugged into slot "..."`
3. Verify slot name matches exactly (case-sensitive)
4. Check priority - might be hidden by other plugins
5. Verify `<MySlot.Slot />` is in the component JSX
6. Check props - plugin might have conditional rendering

**Event not firing?**

1. Verify event name matches exactly
2. Check that handler is registered before event is raised
3. Use `console.log` in event handler to verify it's called
4. Check dependencies in `useEvent(handler, deps)`

### Typical Tasks

**Task: "Add a button to FilmSim cards"**

1. Check if `FilmSimCardOverlay` slot exists (it does!)
2. Create plugin component: `plugins/my-feature/my-button.tsx`
3. Create runtime file: `plugins/my-feature/my-feature.runtime.tsx`
4. Register: `FilmSimCardOverlay.plug(<MyButton />, 20)`
5. Test - button appears on all FilmSim cards!

**Task: "Add a section to FilmSim detail page"**

1. Check `FilmSimDetailSection` slot exists (it does!)
2. Create wrapper component: `plugins/my-feature/my-section-wrapper.tsx`
3. Create runtime file: `plugins/my-feature/my-feature.runtime.tsx`
4. Register: `FilmSimDetailSection.plug(<MySectionWrapper />, 50)`
5. Test - section appears on detail page!

**Task: "Make components refresh when data changes"**

1. Find or create event: `event-definitions.ts`
2. Raise event when data changes: `MyEvent.raise(data)`
3. Listen in component: `MyEvent.useEvent((data) => refresh(), [])`
4. Or use auto-refresh: `const { id } = MyEvent.useRefresh()` then `key={id}`

### Common Patterns

**Pattern 1: Conditional Plugin**

```typescript
MySlot.plug(<MyComponent if={(context) => context.user?.isAdmin} />, 10);
```

**Pattern 2: Multiple Plugins**

```typescript
// Plugin 1
MySlot.plug(<Button1 />, 10);

// Plugin 2
MySlot.plug(<Button2 />, 20);

// Both render in order: Button1, then Button2
```

**Pattern 3: Event-Driven Refresh**

```typescript
// Component A: Save data and notify
async function save() {
  await api.save(data);
  FilmSimChanged.raise(); // Notify all listeners
}

// Component B: Refresh when data changes
function FilmSimList() {
  const { id } = FilmSimChanged.useRefresh();
  return <div key={id}>{/* List refreshes when key changes */}</div>;
}
```

See event definition: `15:15:client/src/lib/events/event-definitions.ts`
See `raise()` implementation: `96:107:client/src/lib/events/create-event.ts`
See `useRefresh()` implementation: `185:192:client/src/lib/events/create-event.ts`

---

## Visual Diagrams

### Plugin Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    APP STARTUP (main.tsx)                   │
│                                                              │
│  scanRuntimeFiles()                                          │
│    ↓                                                         │
│  Vite's import.meta.glob finds *.runtime.tsx files          │
│    ↓                                                         │
│  Files are imported (eager: true)                           │
│    ↓                                                         │
│  Runtime files execute immediately                            │
│    ↓                                                         │
│  .plug() calls register components in slotRegistry           │
│    ↓                                                         │
│  React app renders                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT RENDER (FilmSimCard.tsx)              │
│                                                              │
│  <FilmSimCardOverlay.Slot />                                 │
│    ↓                                                         │
│  Slot component calls useItems() hook                        │
│    ↓                                                         │
│  Hook subscribes to slotRegistry changes                    │
│    ↓                                                         │
│  Gets all registered items for this slot                    │
│    ↓                                                         │
│  Filters by condition (if prop)                             │
│    ↓                                                         │
│  Sorts by priority                                          │
│    ↓                                                         │
│  Renders each item with props                                │
│    ↓                                                         │
│  Plugins appear in UI!                                       │
└─────────────────────────────────────────────────────────────┘
```

### Slot Registry Structure

```
slotRegistry (Map<string, SlotItem[]>)
│
├── "FilmSimCardOverlay"
│   ├── { component: <AddToListButton />, priority: 10, id: "..." }
│   └── { component: <ShareButton />, priority: 20, id: "..." }
│
├── "FilmSimCardFooter"
│   └── { component: <TagsDisplay />, priority: 50, id: "..." }
│
└── "HomePageFeaturedSection"
    ├── { component: <FilmSimHero />, priority: 10, id: "..." }
    ├── { component: <ListHero />, priority: 20, id: "..." }
    └── { component: <PresetHero />, priority: 30, id: "..." }
```

### Event Flow Diagram

```
┌──────────────┐                    ┌──────────────┐
│  Component A │                    │  Component B │
│              │                    │              │
│  save() {    │                    │  MyEvent.    │
│    ...       │                    │    useEvent( │
│    MyEvent.  │─── raise() ────────│      handler │
│      raise() │                    │    )         │
│  }           │                    │              │
└──────────────┘                    └──────────────┘
         │                                   │
         │                                   │
         └─────────── eventRegistry ─────────┘
                    (Map<string, Set>)
```

### File Structure Diagram

```
client/src/
├── lib/
│   ├── slots/
│   │   ├── create-slot.tsx          ← Core slot system
│   │   └── slot-definitions.ts      ← All available slots
│   ├── events/
│   │   ├── create-event.ts          ← Core event system
│   │   └── event-definitions.ts     ← All available events
│   └── plugins/
│       └── scanner.ts               ← Auto-discovery
│
├── components/
│   └── cards/
│       └── FilmSimCard.tsx          ← Uses <FilmSimCardOverlay.Slot />
│
└── plugins/
    └── filmsim-card-defaults/
        ├── filmsim-card-defaults.runtime.tsx  ← Registers plugins
        └── add-to-list-button.tsx            ← Plugin component
```

---

## Complete Example: FilmSim Card Plugin

### File 1: Slot Definition

```27:28:client/src/lib/slots/slot-definitions.ts
/** FilmSim card overlay actions (buttons, icons) */
export const FilmSimCardOverlay = createSlot("FilmSimCardOverlay");
```

### File 2: Component Using Slot

```123:128:client/src/components/cards/FilmSimCard.tsx
        {/* Overlay actions - plugins can inject buttons/actions here */}
        <FilmSimCardOverlay.Slot
          id={id}
          name={name}
          slug={slug}
          onAddToList={handleAddToList}
        />
```

Full component: `51:224:client/src/components/cards/FilmSimCard.tsx`

### File 3: Plugin Component

```6:27:client/src/plugins/filmsim-card-defaults/add-to-list-button.tsx
export function AddToListButton({
  id: _id,
  name: _name,
  onAddToList,
}: {
  id: string;
  name: string;
  onAddToList?: (e: React.MouseEvent) => void;
}) {
  return (
    <Box className="add-to-list-button" sx={overlayButtonStyles}>
      <IconButton
        className="floating"
        onClick={onAddToList}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
```

### File 4: Runtime File (Registers Plugin)

```1:18:client/src/plugins/filmsim-card-defaults/filmsim-card-defaults.runtime.tsx
/**
 * FilmSim Card Default Plugins
 *
 * This runtime file registers the default FilmSim card actions.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import { FilmSimCardOverlay } from "lib/slots/slot-definitions";
import { AddToListButton } from "./add-to-list-button";

// Register default "Add to List" button
FilmSimCardOverlay.plug(
  <AddToListButton key="add-to-list-button" />,
  10
);
```

### File 5: Scanner (Auto-Discovery)

```12:21:client/src/main.tsx
// Scan and load all runtime plugin files
scanRuntimeFiles().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  );
});
```

Scanner implementation:

```38:93:client/src/lib/plugins/scanner.ts
export async function scanRuntimeFiles(): Promise<void> {
  try {
    // Load app-level config first
    // Patterns are relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.app.{ts,tsx}" matches all app files
    const appModules = import.meta.glob(
      ["../../**/*.app.{ts,tsx}", "../../**/startup-main.{ts,tsx}"],
      { eager: true }
    );

    // Load runtime files (eager for now, can be lazy later)
    // Pattern is relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.runtime.{ts,tsx}" matches all runtime files
    const runtimeModules = import.meta.glob(["../../**/*.runtime.{ts,tsx}"], {
      eager: true,
    });

    // Track loaded files
    Object.keys(appModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        console.log(`Loaded app/startup file: ${path}`);
      }
    });

    Object.keys(runtimeModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        // Access the module to ensure it's executed
        // With eager: true, the module is already executed, but we access it to be sure
        const module = runtimeModules[path];
        if (module && typeof module === "object") {
          // Try to access default export or any exports to ensure execution
          try {
            // Accessing the module ensures side effects run
            if ("default" in module) {
              module.default;
            }
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(
          `✅ Loaded runtime file: ${path}`,
          Object.keys(module || {})
        );
      }
    });

    console.log(
      `📦 Total runtime files loaded: ${Object.keys(runtimeModules).length}`
    );
  } catch (error) {
    console.error("Error scanning runtime files:", error);
  }
}
```

**Result:** Every `FilmSimCard` now has an "Add to List" button in the overlay!

---

## Summary: Key Takeaways

1. **Slots = Where**: Define placeholders in components, plugins fill them
2. **Events = Communication**: Components talk through events, not props
3. **Runtime Files = Registration**: `.runtime.tsx` files register plugins at startup
4. **Auto-Discovery**: Scanner finds all runtime files automatically
5. **Priority System**: Lower numbers render first (10 before 20)
6. **No Core Modification**: Add features without touching core components
7. **Reactive**: Slot registry updates trigger React re-renders automatically

**You're now ready to implement plugins!** Start with a simple button plugin, then move to more complex features.
