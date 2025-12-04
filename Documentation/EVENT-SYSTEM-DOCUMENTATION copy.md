# Event System Documentation

A production-grade, distributed event system for React applications with pub/sub, hierarchical events, React hooks integration, and distributed server coordination.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Core Concepts](#core-concepts)
5. [Client-Side API Reference](#client-side-api-reference)
6. [Server-Side API Reference](#server-side-api-reference)
7. [React Integration](#react-integration)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)
10. [Implementation Examples](#implementation-examples)

---

## Overview

### What is it?

A **pub/sub event system** designed for:

-   **Decoupled communication** between React components without prop drilling
-   **Distributed coordination** across multiple server instances via Redis
-   **Real-time updates** from server to specific clients, users, or browser tabs
-   **Hierarchical event namespacing** with wildcard matching
-   **Automatic debouncing** and deduplication to prevent event storms

### Key Features

-   ✅ **Zero prop drilling** - components communicate via events
-   ✅ **React hooks integration** - `useEvent()`, `useRefresh()` built-in
-   ✅ **Hierarchical events** - namespace events with wildcards (e.g., `User.*.Updated`)
-   ✅ **Distributed events** - coordinate across multiple server processes
-   ✅ **Targeted delivery** - send to specific clients, users, or browser tabs
-   ✅ **Automatic debouncing** - prevent rapid-fire event storms
-   ✅ **Event collection** - gather return values from multiple handlers
-   ✅ **Async support** - handle async event handlers with `callAsync()`
-   ✅ **Event phases** - early/late execution phases for ordering

### When to Use

**✅ Good use cases:**

-   Inter-component communication without passing props
-   Real-time notifications from server to clients
-   Cache invalidation across distributed servers
-   Progress updates for long-running jobs
-   Plugin systems where components contribute functionality
-   Form validation with multiple validators

**❌ Not ideal for:**

-   Parent-to-child data flow (use props)
-   Simple state management (use useState/context)
-   Large data transfer (use refs or separate storage)

---

## Architecture

### Client-Side Architecture

```
┌─────────────────┐
│   Component A   │──┐
│   (raises)      │  │
└─────────────────┘  │
                     ├──> Event Bus ──> ┌─────────────────┐
┌─────────────────┐  │                  │   Component B   │
│   Component C   │──┘                  │   (listens)     │
│   (raises)      │                     └─────────────────┘
└─────────────────┘
```

**Key Principles:**

-   Events are created with `createEvent(name)`
-   Components `raise()` events to broadcast
-   Other components `useEvent()` to listen
-   All synchronous on client-side (no network delay)
-   Automatic cleanup when components unmount

### Server-Side Architecture (Distributed)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Server 1    │         │     Redis    │         │  Server 2    │
│              │         │   Pub/Sub    │         │              │
│  emit(event) ├────────>│              │<────────┤ subscribes   │
│              │         │   Replay     │         │   handles    │
└──────────────┘         │   Buffer     │         └──────────────┘
                         └──────────────┘
                                │
                                ├──> Browser Client 1 (WebSocket)
                                ├──> Browser Client 2 (WebSocket)
                                └──> Browser Client 3 (WebSocket)
```

**Key Features:**

-   `emit()` broadcasts to all server instances via Redis
-   Event replay buffer (10min) ensures eventual consistency
-   `raiseForCurrentClient()` targets specific browser clients
-   WebSocket pushes events from server to browser
-   Automatic catch-up if servers miss events

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
npm install lodash
# Optional: Redis for distributed events
npm install ioredis
```

### Step 2: Core Event System Implementation

Create `library/local-events.js`:

```javascript
import { debounce, throttle } from "lodash"

/**
 * Create an event system
 * @param {string} name - Event name
 * @param {function|object} options - Extract function or options object
 * @returns {Event} Event object with raise/handle/useEvent methods
 */
export function createEvent(name, options = {}) {
    // Parse options
    const config = typeof options === "function" ? { extract: options } : options

    const {
        extract = null, // Extract function for return values
        isAsync = false, // Whether event is async
        extended = false, // Enable early/late phases
        expose = null, // Expose custom method
        parameters = null, // Transform parameters
    } = config

    // Handler storage
    const handlers = []
    const handlerMap = new Map() // For handleId()

    // Debounce caches
    const debounceCache = new Map()
    const dedupeCache = new Map()

    // Event object
    const event = {
        eventName: name,

        // === RAISING METHODS ===

        /**
         * Raise event immediately, fires all handlers synchronously
         */
        raise(...args) {
            const processedArgs = parameters ? parameters(...args) : args

            for (const handler of handlers) {
                try {
                    handler(...processedArgs)
                } catch (error) {
                    console.error(`Error in event handler for ${name}:`, error)
                }
            }
        },

        /**
         * Raise event asynchronously, waits for all handlers
         */
        async raiseAsync(...args) {
            const processedArgs = parameters ? parameters(...args) : args

            await Promise.all(
                handlers.map(async (handler) => {
                    try {
                        await handler(...processedArgs)
                    } catch (error) {
                        console.error(`Error in async event handler for ${name}:`, error)
                    }
                })
            )
        },

        /**
         * Raise event with 20ms debounce
         */
        raiseOnce(...args) {
            return event.raiseOnceDelay(20, ...args)
        },

        /**
         * Raise event with custom debounce delay
         */
        raiseOnceDelay(ms, ...args) {
            const key = name
            if (!debounceCache.has(key)) {
                debounceCache.set(
                    key,
                    debounce((...debouncedArgs) => {
                        event.raise(...debouncedArgs)
                    }, ms)
                )
            }
            debounceCache.get(key)(...args)
        },

        /**
         * Raise event with deduplication by key
         */
        raiseOnceDedupe(keyFn, ...args) {
            const key = keyFn(...args)
            if (!dedupeCache.has(key)) {
                dedupeCache.set(
                    key,
                    debounce((...debouncedArgs) => {
                        event.raise(...debouncedArgs)
                        dedupeCache.delete(key)
                    }, 20)
                )
            }
            dedupeCache.get(key)(...args)
        },

        /**
         * Raise on next tick
         */
        raiseLater(...args) {
            setTimeout(() => event.raise(...args), 0)
        },

        // === HANDLER METHODS ===

        /**
         * Add event handler, returns remove function
         */
        handle(handler) {
            handlers.push(handler)
            return () => {
                const index = handlers.indexOf(handler)
                if (index > -1) handlers.splice(index, 1)
            }
        },

        /**
         * Add handler that only fires once
         */
        handleOnce(handler) {
            const wrapper = (...args) => {
                remove()
                return handler(...args)
            }
            const remove = event.handle(wrapper)
            return remove
        },

        /**
         * Add named handler (replaces previous with same id)
         */
        handleId(id, handler) {
            if (handlerMap.has(id)) {
                const remove = handlerMap.get(id)
                remove()
            }
            const remove = event.handle(handler)
            handlerMap.set(id, remove)
            return remove
        },

        // Aliases
        on: null, // Set below
        once: null, // Set below

        // === COLLECTION METHODS ===

        /**
         * Call all handlers synchronously and collect results
         */
        call(...args) {
            const processedArgs = parameters ? parameters(...args) : args
            let result = null

            for (const handler of handlers) {
                try {
                    const handlerResult = handler(...processedArgs)
                    if (extract) {
                        result = extract([handlerResult])
                    }
                } catch (error) {
                    console.error(`Error in event handler for ${name}:`, error)
                }
            }

            return extract ? result : undefined
        },

        /**
         * Call all handlers asynchronously and collect results
         */
        async callAsync(...args) {
            const processedArgs = parameters ? parameters(...args) : args
            const results = []

            await Promise.all(
                handlers.map(async (handler) => {
                    try {
                        const result = await handler(...processedArgs)
                        results.push(result)
                    } catch (error) {
                        console.error(`Error in async event handler for ${name}:`, error)
                    }
                })
            )

            return extract ? extract(results) : results
        },

        // === UTILITY METHODS ===

        /**
         * Wait for event to be raised
         */
        wait(timeout = 0) {
            return new Promise((resolve, reject) => {
                const timer = timeout > 0 ? setTimeout(() => reject(new Error("Timeout")), timeout) : null

                const remove = event.handleOnce((...args) => {
                    if (timer) clearTimeout(timer)
                    resolve(args)
                })
            })
        },

        /**
         * Async iterator over event emissions
         */
        async *iterateEvents() {
            const queue = []
            let resolve = null

            const remove = event.handle((...args) => {
                if (resolve) {
                    resolve(args)
                    resolve = null
                } else {
                    queue.push(args)
                }
            })

            try {
                while (true) {
                    if (queue.length > 0) {
                        yield queue.shift()
                    } else {
                        yield await new Promise((r) => {
                            resolve = r
                        })
                    }
                }
            } finally {
                remove()
            }
        },

        /**
         * Property that returns a function to raise the event
         */
        get invoke() {
            return (...args) => event.raise(...args)
        },
    }

    // Set aliases
    event.on = event.handle
    event.once = event.handleOnce

    // === HIERARCHICAL EVENTS ===

    /**
     * Create sub-event or wildcard event
     * Usage: MyEvent("SubName") or MyEvent("**") for wildcard
     */
    event.call = function (subName) {
        return createEvent(`${name}.${subName}`, config)
    }

    // Allow calling event as function for sub-events
    const proxy = new Proxy(event.call, {
        get: (target, prop) => event[prop],
        apply: (target, thisArg, args) => event.call(...args),
    })

    // === EXTENDED PHASES ===

    if (extended) {
        event.early = createEvent(`${name}.early`, config)
        event.late = createEvent(`${name}.late`, config)
        event.before = event.early
        event.after = event.late
    }

    // === EXPOSE CUSTOM METHOD ===

    if (expose) {
        const exposeName = typeof expose === "string" ? expose : expose.name
        const exposeTransform = typeof expose === "object" ? expose.transform : null

        event[exposeName] = (...args) => {
            const transformed = exposeTransform ? exposeTransform(...args) : args
            event.raise(...transformed)
        }
    }

    return proxy
}
```

### Step 3: React Hooks Integration

Add React hooks decorator:

```javascript
import { useEffect, useReducer, useRef } from "react"

/**
 * Decorate event with React hooks
 */
export function decorateEventWithReactHooks(event) {
    /**
     * React hook to listen to event
     * @param {function} handler - Event handler
     * @param {array} deps - Dependency array
     */
    event.useEvent = function (handler, deps = []) {
        useEffect(() => {
            const remove = event.handle(handler)
            return remove
        }, deps)
    }

    /**
     * React hook that refreshes component when event is raised
     */
    event.useRefresh = function () {
        const [, forceUpdate] = useReducer((x) => x + 1, 0)
        const idRef = useRef(0)

        useEffect(() => {
            const remove = event.handle(() => {
                idRef.current++
                forceUpdate()
            })
            return remove
        }, [])

        return { id: idRef.current, refresh: forceUpdate }
    }

    /**
     * Raise event in React transition
     */
    event.fireInTransition = function (...args) {
        if (typeof React !== "undefined" && React.startTransition) {
            React.startTransition(() => {
                event.raise(...args)
            })
        } else {
            event.raise(...args)
        }
    }

    return event
}

// Apply to createEvent
const originalCreateEvent = createEvent
export function createEvent(name, options) {
    const event = originalCreateEvent(name, options)
    return decorateEventWithReactHooks(event)
}
```

### Step 4: Define Your Events

Create `event-definitions.js`:

```javascript
import { createEvent } from "./library/local-events"

// Basic events
export const DataChanged = createEvent("DataChanged")
export const UserLoggedIn = createEvent("UserLoggedIn")
export const TaskSelected = createEvent("TaskSelected")

// Event with extract function
export const GetUserRole = createEvent("GetUserRole", (v) => v[0]?.role)

// Async event
export const ValidateForm = createEvent("ValidateForm", {
    isAsync: true,
    extract: (v) => v.every((result) => result === true),
})

// Event with phases
export const SaveData = createEvent("SaveData", { extended: true })

// Event with custom method
export const Navigate = createEvent("Navigate", {
    expose: {
        name: "to",
        transform: (path) => ({ path, timestamp: Date.now() }),
    },
})

// Hierarchical events
export const BasketUpdate = createEvent("BasketUpdate")
export const AllBasketUpdates = BasketUpdate("**")
export const ScheduleBasketUpdate = BasketUpdate("ScheduleBasket")
```

---

## Core Concepts

### 1. Events

Events are named notification channels. Components can **raise** (broadcast) events and **handle** (listen to) them.

```javascript
// Create an event
export const UserUpdated = createEvent("UserUpdated")

// Raise it
UserUpdated.raise({ userId: "123", name: "John" })

// Handle it
UserUpdated.handle(({ userId, name }) => {
    console.log(`User ${userId} updated: ${name}`)
})
```

### 2. Hierarchical Events

Events can have hierarchical names with wildcards:

```javascript
// Define hierarchy
export const User = createEvent("User")
export const UserCreated = User("Created")
export const UserUpdated = User("Updated")
export const AllUserEvents = User("*") // Wildcard

// Raise specific event
UserCreated.raise({ userId: "123" })

// Listen to all user events
AllUserEvents.handle((data) => {
    console.log("Any user event:", data)
})
```

### 3. React Integration

The system integrates seamlessly with React hooks:

```javascript
function MyComponent() {
    const refresh = useRefresh()

    // Listen to event
    DataChanged.useEvent(() => {
        console.log("Data changed!")
        refresh()
    }, [refresh])

    // Or auto-refresh when event fires
    const autoRefresh = DataChanged.useRefresh()

    return <div key={autoRefresh.id}>...</div>
}
```

### 4. Event Collection

Gather return values from multiple handlers:

```javascript
// Define event
export const MenuItems = createEvent("MenuItems")

// Handlers contribute items
MenuItems.handle(({ items }) => {
    items.push({ label: "Save", action: save })
})

MenuItems.handle(({ items }) => {
    items.push({ label: "Delete", action: delete })
})

// Collect all items
function buildMenu() {
    const items = []
    MenuItems.call({ items })
    return items // [{ label: "Save", ... }, { label: "Delete", ... }]
}
```

### 5. Debouncing

Prevent event storms with built-in debouncing:

```javascript
// Fires at most once per 20ms
MyEvent.raiseOnce(data)

// Custom delay (1000ms)
MyEvent.raiseOnceDelay(1000, data)

// Deduplicate by key
items.forEach((item) => {
    ItemUpdated.raiseOnceDedupe(
        (id) => id, // Key function
        item.id,
        item
    )
})
```

---

## Client-Side API Reference

### Creating Events

#### `createEvent(name, options)`

Creates a new event.

**Parameters:**

-   `name` (string): Event name
-   `options` (function | object): Extract function or options object
    -   `extract` (function): Extract return value from handlers
    -   `isAsync` (boolean): Whether event is async
    -   `extended` (boolean): Enable early/late phases
    -   `expose` (string | object): Expose custom method
    -   `parameters` (function): Transform parameters before handlers

**Returns:** Event object

**Examples:**

```javascript
// Basic event
const MyEvent = createEvent("MyEvent")

// With extract function
const GetValue = createEvent("GetValue", (v) => v[0])

// With options
const ValidateForm = createEvent("ValidateForm", {
    isAsync: true,
    extract: (results) => results.every((r) => r === true),
})

// With custom method
const Navigate = createEvent("Navigate", {
    expose: {
        name: "to",
        transform: (path) => ({ path }),
    },
})
// Usage: Navigate.to("/home")
```

### Raising Events

#### `event.raise(...args)`

Raise event immediately, fires all handlers synchronously.

```javascript
UserUpdated.raise({ userId: "123", name: "John" })
```

#### `event.raiseAsync(...args)`

Raise event asynchronously, waits for all async handlers.

```javascript
await FormSubmitted.raiseAsync(formData)
```

#### `event.raiseOnce(...args)`

Raise with 20ms debounce (prevents rapid-fire events).

```javascript
FieldChanged.raiseOnce({ field: "name", value: "John" })
```

#### `event.raiseOnceDelay(ms, ...args)`

Raise with custom debounce delay.

```javascript
SearchQuery.raiseOnceDelay(500, query)
```

#### `event.raiseOnceDedupe(keyFn, ...args)`

Raise with deduplication by key function.

```javascript
items.forEach((item) => {
    ItemUpdated.raiseOnceDedupe(
        (id) => id, // Dedupe by item.id
        item.id,
        item
    )
})
```

#### `event.raiseLater(...args)`

Raise on next tick (setTimeout 0).

```javascript
DataLoaded.raiseLater(data)
```

#### `event.fireInTransition(...args)`

Raise in React transition (React 18+).

```javascript
DataChanged.fireInTransition(data)
```

### Handling Events

#### `event.handle(handler)`

Add event handler. Returns remove function.

```javascript
const remove = UserUpdated.handle(({ userId, name }) => {
    console.log(`User ${userId}: ${name}`)
})

// Later: remove handler
remove()
```

#### `event.handleOnce(handler)`

Add handler that fires only once, then auto-removes.

```javascript
PageLoaded.handleOnce(() => {
    console.log("Page loaded!")
})
```

#### `event.handleId(id, handler)`

Add named handler. Replaces previous handler with same ID.

```javascript
UserUpdated.handleId("logger", (user) => {
    console.log("User updated:", user)
})

// Replaces previous logger
UserUpdated.handleId("logger", (user) => {
    console.log("NEW logger:", user)
})
```

#### `event.on(handler)` / `event.once(handler)`

Aliases for `handle()` and `handleOnce()`.

### Collection Methods

#### `event.call(...args)`

Call all handlers synchronously, return extracted value.

```javascript
const MenuItems = createEvent("MenuItems")

MenuItems.handle(({ items }) => {
    items.push({ label: "Save" })
})

const items = []
MenuItems.call({ items })
console.log(items) // [{ label: "Save" }]
```

#### `event.callAsync(...args)`

Call all async handlers, await all, return extracted value.

```javascript
const ValidateForm = createEvent("ValidateForm", {
    isAsync: true,
    extract: (results) => results.every((r) => r === true),
})

ValidateForm.handle(async ({ data }) => {
    return await validateEmail(data.email)
})

ValidateForm.handle(async ({ data }) => {
    return await validatePassword(data.password)
})

const isValid = await ValidateForm.callAsync({ data: formData })
```

### Utility Methods

#### `event.wait(timeout)`

Returns promise that resolves when event is raised.

```javascript
// Wait indefinitely
const args = await DataLoaded.wait()

// Wait with timeout
try {
    const args = await DataLoaded.wait(5000) // 5 seconds
} catch (error) {
    console.error("Timeout")
}
```

#### `event.iterateEvents()`

Async iterator over event emissions.

```javascript
for await (const [data] of DataChanged.iterateEvents()) {
    console.log("Data changed:", data)
}
```

#### `event.invoke`

Property that returns a function to raise the event.

```javascript
const raiseDataChanged = DataChanged.invoke
raiseDataChanged(data) // Same as DataChanged.raise(data)
```

### Hierarchical Events

#### `event(subName)`

Create sub-event or access hierarchical event.

```javascript
const User = createEvent("User")
const UserCreated = User("Created")
const UserUpdated = User("Updated")

// Wildcard
const AllUserEvents = User("*")
const DeepWildcard = User("**")

UserCreated.raise({ userId: "123" })
```

### Extended Phases

Events created with `extended: true` have early/late phases:

```javascript
const SaveData = createEvent("SaveData", { extended: true })

// Early handlers run first
SaveData.early.handle(() => {
    console.log("Preparing...")
})

// Main handlers
SaveData.handle((data) => {
    console.log("Saving:", data)
})

// Late handlers run last
SaveData.late.handle(() => {
    console.log("Cleanup...")
})

SaveData.raise(data)
// Output:
// Preparing...
// Saving: { ... }
// Cleanup...
```

Aliases: `SaveData.before` (same as `.early`), `SaveData.after` (same as `.late`)

---

## Server-Side API Reference

For distributed systems with multiple server instances.

### Setup: Redis Pub/Sub

```javascript
// server/event-bridge.js
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL)
const pub = new Redis(process.env.REDIS_URL)
const sub = new Redis(process.env.REDIS_URL)

// Event replay buffer (10 minutes)
const EVENT_BUFFER_TTL = 600
let eventCounter = 0

/**
 * Emit event to all server instances via Redis
 */
export function emit(eventName, ...args) {
    const eventId = ++eventCounter
    const payload = {
        id: eventId,
        name: eventName,
        args: args,
        timestamp: Date.now(),
    }

    // Store in replay buffer
    pub.setex(`event:${eventName}:${eventId}`, EVENT_BUFFER_TTL, JSON.stringify(payload))

    // Publish to Redis channel
    pub.publish("events", JSON.stringify(payload))
}

/**
 * Subscribe to events from Redis
 */
export function subscribeToEvents(callback) {
    sub.subscribe("events")
    sub.on("message", (channel, message) => {
        const payload = JSON.parse(message)
        callback(payload.name, ...payload.args)
    })
}

/**
 * Catch up on missed events
 */
export async function catchUpEvents(lastEventId, callback) {
    // Fetch events since lastEventId
    // ... implementation
}
```

### Server-Side Event Methods

#### `event.emit(...args)`

Broadcast to ALL server instances via Redis pub/sub.

```javascript
import { FlushCache } from "./event-definitions"

async function updateData(id, data) {
    await db.update(id, data)

    // Invalidate cache on all servers
    FlushCache.emit(id)
}
```

#### `event.raiseOnAllClients(...args)`

Send to ALL connected browser clients (all servers).

```javascript
MaintenanceMode.raiseOnAllClients({
    enabled: true,
    message: "System maintenance in 5 minutes",
})
```

#### `event.raiseForCurrentClient(...args)`

Send to current client only (all tabs of that client).

```javascript
export async function saveUserSettings(userId, settings) {
    await db.saveSettings(userId, settings)

    // Notify current client to refresh
    SettingsUpdated.raiseForCurrentClient(settings)
}
```

#### `event.raiseForCurrentUser(...args)`

Send to current user (all devices/clients).

```javascript
export async function approveRequest(requestId) {
    const request = await db.getRequest(requestId)

    // Notify user on all their devices
    RequestApproved.raiseForCurrentUser({
        requestId: request.id,
        message: "Your request has been approved",
    })
}
```

#### `event.raiseForCurrentInstance(...args)`

Send to current browser tab only.

```javascript
export async function processLargeJob(jobId) {
    for (let i = 0; i < items.length; i++) {
        await processItem(items[i])

        // Send progress to specific tab
        JobProgress.raiseForCurrentInstance({
            jobId,
            percent: (i / items.length) * 100,
        })
    }
}
```

#### Specific Targeting

```javascript
// Target specific client
event.raiseForClient(clientId, ...args)

// Target specific user
event.raiseForUser(userId, ...args)

// Target specific instance
event.raiseForInstance(instanceId, ...args)
```

---

## React Integration

### Hook: `useEvent(handler, deps)`

Listen to events in React components.

```javascript
import { UserUpdated } from "./event-definitions"

function UserProfile() {
    const [user, setUser] = useState(null)

    // Listen to UserUpdated event
    UserUpdated.useEvent(
        (updatedUser) => {
            if (updatedUser.id === user?.id) {
                setUser(updatedUser)
            }
        },
        [user]
    )

    return <div>{user?.name}</div>
}
```

### Hook: `useRefresh()`

Auto-refresh component when event fires.

```javascript
import { DataChanged } from "./event-definitions"

function DataList() {
    const refresh = DataChanged.useRefresh()
    const data = fetchData() // Re-fetches when refresh.id changes

    return (
        <div key={refresh.id}>
            {data.map((item) => (
                <Item key={item.id} item={item} />
            ))}
        </div>
    )
}
```

### Component: `<Event.Refresh>`

Render prop component for auto-refresh.

```javascript
function DataList() {
    return <DataChanged.Refresh>{() => <DataListContent />}</DataChanged.Refresh>
}
```

### Pattern: Manual Refresh Control

```javascript
function MyComponent() {
    const [refreshId, setRefreshId] = useState(0)
    const refresh = () => setRefreshId((id) => id + 1)

    DataChanged.useEvent(refresh, [])

    return <div key={refreshId}>...</div>
}
```

---

## Advanced Features

### 1. Event Collection Pattern

Collect contributions from multiple handlers:

```javascript
// Define collection event
export const MenuItems = createEvent("MenuItems")

// Plugin 1 contributes
MenuItems.handle(({ items }) => {
    items.push({ label: "Save", action: save })
})

// Plugin 2 contributes
MenuItems.handle(({ items }) => {
    items.push({ label: "Delete", action: deleteItem })
})

// Plugin 3 contributes (conditional)
MenuItems.handle(({ items, canExport }) => {
    if (canExport) {
        items.push({ label: "Export", action: exportData })
    }
})

// Collect all menu items
function buildContextMenu(canExport) {
    const items = []
    MenuItems.call({ items, canExport })
    return items
}
```

### 2. Async Validation Pattern

Multiple async validators contribute results:

```javascript
export const ValidateUser = createEvent("ValidateUser", {
    isAsync: true,
    extract: (results) => {
        // All validators must return { valid: true }
        return results.every((r) => r.valid)
    },
})

// Email validator
ValidateUser.handle(async ({ email }) => {
    const exists = await checkEmailExists(email)
    return {
        valid: !exists,
        errors: exists ? ["Email already taken"] : [],
    }
})

// Password validator
ValidateUser.handle(async ({ password }) => {
    const strong = password.length >= 8
    return {
        valid: strong,
        errors: strong ? [] : ["Password too weak"],
    }
})

// Usage
async function validateUserForm(data) {
    const result = await ValidateUser.callAsync(data)
    return result // true if all validators passed
}
```

### 3. Event Phases for Ordering

Control execution order with phases:

```javascript
export const ProcessData = createEvent("ProcessData", { extended: true })

// Early: Validation
ProcessData.early.handle((data) => {
    if (!data.id) throw new Error("Missing ID")
})

// Main: Processing
ProcessData.handle(async (data) => {
    await saveToDatabase(data)
})

ProcessData.handle(async (data) => {
    await updateSearchIndex(data)
})

// Late: Cleanup and notifications
ProcessData.late.handle((data) => {
    clearTempFiles(data.id)
})

ProcessData.late.handle((data) => {
    notifyUsers(data)
})

// All phases fire in order
ProcessData.raise(data)
```

### 4. Hierarchical Event Routing

Route events based on namespace:

```javascript
// Define hierarchy
export const User = createEvent("User")
export const UserCreated = User("Created")
export const UserUpdated = User("Updated")
export const UserDeleted = User("Deleted")

// Listen to all user events
export const AllUserEvents = User("*")

// Deep wildcard (any depth)
export const AllEvents = User("**")

// Specific listeners
UserCreated.handle((user) => {
    sendWelcomeEmail(user)
})

UserDeleted.handle((userId) => {
    cleanupUserData(userId)
})

// Generic listener for all
AllUserEvents.handle((data, eventName) => {
    logActivity(eventName, data)
})

// Raise specific events
UserCreated.raise({ id: "123", name: "John" })
UserUpdated.raise({ id: "123", name: "Jane" })
```

### 5. Event Wait Pattern

Wait for an event before proceeding:

```javascript
async function waitForUserLogin() {
    console.log("Waiting for login...")
    const [user] = await UserLoggedIn.wait(30000) // 30 second timeout
    console.log("User logged in:", user)
    return user
}

// Or without timeout
async function indefiniteWait() {
    const [data] = await DataLoaded.wait()
    return data
}
```

### 6. Event Stream Pattern

Process events as they arrive:

```javascript
async function monitorDataChanges() {
    for await (const [data] of DataChanged.iterateEvents()) {
        console.log("Processing change:", data)
        await processChange(data)
    }
}

// Start monitoring
monitorDataChanges()
```

---

## Best Practices

### 1. Event Payload Strategy

**❌ BAD: Large payloads**

```javascript
// Don't send large data through events
ProcessComplete.raise({
    pdfData: largeBuffer, // Multiple MB!
    results: hugeArray,
})
```

**✅ GOOD: Small signals + separate storage**

```javascript
// Store large data separately, send reference
const jobId = generateId()
await redis.set(`job:${jobId}:result`, largeData, { ex: 300 }) // 5min TTL

ProcessComplete.raise({ jobId })

// Receiver fetches on-demand
ProcessComplete.useEvent(async ({ jobId }) => {
    const data = await redis.get(`job:${jobId}:result`)
    displayResults(JSON.parse(data))
})
```

**Why:**

-   Events should be signals, not data transfer
-   Large payloads slow down all subscribers
-   Separate storage allows targeted retrieval
-   Automatic cleanup with TTL

### 2. Debouncing for High-Frequency Events

**❌ BAD: Event storm**

```javascript
for (let i = 0; i < 1000; i++) {
    ProgressUpdate.raise({ percent: i }) // 1000 events!
}
```

**✅ GOOD: Debounced updates**

```javascript
for (let i = 0; i < 1000; i++) {
    ProgressUpdate.raiseOnceDelay(1000, { percent: i }) // Max 1/second
}
```

**✅ GOOD: Deduplicate by key**

```javascript
items.forEach((item) => {
    ItemUpdated.raiseOnceDedupe(
        (id) => id, // Dedupe function
        item.id,
        item
    )
})
```

### 3. Idempotent Event Handlers

Event handlers should be safe to call multiple times:

**❌ BAD: Non-idempotent**

```javascript
let counter = 0
DataUpdated.handle(() => {
    counter++ // Changes state on every call
})
```

**✅ GOOD: Idempotent**

```javascript
DataUpdated.handle((data) => {
    setData(data) // Safe to call multiple times with same data
})
```

### 4. Cleanup Event Handlers

Always clean up when components unmount:

**❌ BAD: Memory leak**

```javascript
function MyComponent() {
    UserUpdated.handle((user) => {
        // Handler never removed!
        setState(user)
    })
}
```

**✅ GOOD: Cleanup**

```javascript
function MyComponent() {
    useEffect(() => {
        const remove = UserUpdated.handle((user) => {
            setState(user)
        })
        return remove // Cleanup on unmount
    }, [])
}
```

**✅ BEST: Use hooks**

```javascript
function MyComponent() {
    UserUpdated.useEvent((user) => {
        setState(user)
    }, []) // Automatic cleanup
}
```

### 5. Avoid Synchronous Event Chains

**❌ BAD: Event chain**

```javascript
EventA.handle(() => {
    EventB.raise() // Synchronous chain
})

EventB.handle(() => {
    EventC.raise() // Deep nesting
})
```

**✅ GOOD: Direct communication or async**

```javascript
// Option 1: Direct
function handleAction() {
    doA()
    doB()
    doC()
}

// Option 2: Async chain
EventA.handle(() => {
    setTimeout(() => EventB.raise(), 0)
})
```

### 6. Name Events Clearly

**❌ BAD: Vague names**

```javascript
export const Update = createEvent("Update")
export const Change = createEvent("Change")
export const Event1 = createEvent("Event1")
```

**✅ GOOD: Descriptive names**

```javascript
export const UserProfileUpdated = createEvent("UserProfileUpdated")
export const FormFieldChanged = createEvent("FormFieldChanged")
export const OrderPaymentProcessed = createEvent("OrderPaymentProcessed")
```

### 7. Group Related Events

**✅ GOOD: Hierarchical organization**

```javascript
// Group by domain
export const User = createEvent("User")
export const UserCreated = User("Created")
export const UserUpdated = User("Updated")
export const UserDeleted = User("Deleted")

export const Order = createEvent("Order")
export const OrderPlaced = Order("Placed")
export const OrderShipped = Order("Shipped")
export const OrderDelivered = Order("Delivered")
```

### 8. Document Event Contracts

Always document what events send and expect:

```javascript
/**
 * Raised when a user profile is updated
 * @param {Object} user - Updated user object
 * @param {string} user.id - User ID
 * @param {string} user.name - User name
 * @param {string} user.email - User email
 */
export const UserUpdated = createEvent("UserUpdated")

/**
 * Raised to collect menu items for context menu
 * @param {Object} params
 * @param {Array} params.items - Array to push menu items into
 * @param {boolean} params.canEdit - Whether user can edit
 * @param {Object} params.context - Context object
 */
export const ContextMenuItems = createEvent("ContextMenuItems")
```

---

## Implementation Examples

### Example 1: Global Notification System

```javascript
// event-definitions.js
export const ShowNotification = createEvent("ShowNotification")

// notification-manager.js
import { ShowNotification } from "./event-definitions"

function NotificationManager() {
    const [notifications, setNotifications] = useState([])

    ShowNotification.useEvent((notification) => {
        const id = Date.now()
        setNotifications((prev) => [...prev, { id, ...notification }])

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 5000)
    }, [])

    return (
        <div className="notifications">
            {notifications.map((n) => (
                <Notification key={n.id} {...n} />
            ))}
        </div>
    )
}

// Usage anywhere in app
function SaveButton() {
    async function handleSave() {
        try {
            await saveData()
            ShowNotification.raise({
                type: "success",
                message: "Data saved successfully",
            })
        } catch (error) {
            ShowNotification.raise({
                type: "error",
                message: "Failed to save data",
            })
        }
    }

    return <button onClick={handleSave}>Save</button>
}
```

### Example 2: Form Validation System

```javascript
// event-definitions.js
export const ValidateField = createEvent("ValidateField", {
    isAsync: true,
    extract: (results) => {
        const errors = results.flatMap((r) => r.errors || [])
        return {
            valid: errors.length === 0,
            errors,
        }
    },
})

// validators/email-validator.js
ValidateField("email").handle(async (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid = emailRegex.test(value)

    if (!valid) {
        return { errors: ["Invalid email format"] }
    }

    // Check if email exists
    const exists = await checkEmailExists(value)
    if (exists) {
        return { errors: ["Email already registered"] }
    }

    return { errors: [] }
})

// validators/password-validator.js
ValidateField("password").handle(async (value) => {
    const errors = []

    if (value.length < 8) {
        errors.push("Password must be at least 8 characters")
    }
    if (!/[A-Z]/.test(value)) {
        errors.push("Password must contain uppercase letter")
    }
    if (!/[0-9]/.test(value)) {
        errors.push("Password must contain number")
    }

    return { errors }
})

// Form component
function RegistrationForm() {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [errors, setErrors] = useState({})

    async function validateForm() {
        const emailResult = await ValidateField("email").callAsync(formData.email)
        const passwordResult = await ValidateField("password").callAsync(formData.password)

        setErrors({
            email: emailResult.errors,
            password: passwordResult.errors,
        })

        return emailResult.valid && passwordResult.valid
    }

    async function handleSubmit() {
        const valid = await validateForm()
        if (valid) {
            await submitForm(formData)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email?.map((err) => (
                <div className="error">{err}</div>
            ))}

            <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password?.map((err) => (
                <div className="error">{err}</div>
            ))}

            <button type="submit">Register</button>
        </form>
    )
}
```

### Example 3: Real-Time Collaboration

```javascript
// event-definitions.js
export const DocumentChanged = createEvent("DocumentChanged")
export const CursorMoved = createEvent("CursorMoved")
export const UserJoined = createEvent("UserJoined")
export const UserLeft = createEvent("UserLeft")

// server/collaboration.server.js
import { DocumentChanged, CursorMoved } from "../event-definitions"

// When user edits document
export async function updateDocument(documentId, userId, changes) {
    await db.documents.update(documentId, changes)

    // Notify all users viewing this document
    DocumentChanged.raiseForClient(`doc:${documentId}`, {
        documentId,
        userId,
        changes,
    })
}

// When user moves cursor
export async function updateCursor(documentId, userId, position) {
    // Notify all users except sender
    CursorMoved.raiseForClient(`doc:${documentId}`, {
        userId,
        position,
    })
}

// client/collaborative-editor.js
function CollaborativeEditor({ documentId }) {
    const [document, setDocument] = useState(null)
    const [cursors, setCursors] = useState({})
    const [users, setUsers] = useState([])

    // Listen to document changes
    DocumentChanged.useEvent(({ userId, changes }) => {
        setDocument((prev) => applyChanges(prev, changes))
        console.log(`User ${userId} made changes`)
    }, [])

    // Listen to cursor movements
    CursorMoved.useEvent(({ userId, position }) => {
        setCursors((prev) => ({
            ...prev,
            [userId]: position,
        }))
    }, [])

    // Listen to user presence
    UserJoined.useEvent((user) => {
        setUsers((prev) => [...prev, user])
    }, [])

    UserLeft.useEvent((userId) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setCursors((prev) => {
            const { [userId]: _, ...rest } = prev
            return rest
        })
    }, [])

    function handleEdit(changes) {
        // Optimistic update
        setDocument((prev) => applyChanges(prev, changes))

        // Send to server
        updateDocument(documentId, currentUser.id, changes)
    }

    function handleCursorMove(position) {
        updateCursor(documentId, currentUser.id, position)
    }

    return (
        <div>
            <Editor document={document} cursors={cursors} onEdit={handleEdit} onCursorMove={handleCursorMove} />
            <UserList users={users} />
        </div>
    )
}
```

### Example 4: Plugin System with Menu Contributions

```javascript
// event-definitions.js
export const ToolbarItems = createEvent("ToolbarItems")

// plugins/save-plugin.js
ToolbarItems.handle(({ items, document }) => {
    items.push({
        id: "save",
        label: "Save",
        icon: "save",
        action: () => saveDocument(document),
        enabled: document.isDirty,
    })
})

// plugins/export-plugin.js
ToolbarItems.handle(({ items, document, canExport }) => {
    if (canExport) {
        items.push({
            id: "export",
            label: "Export",
            icon: "download",
            action: () => exportDocument(document),
        })
    }
})

// plugins/undo-plugin.js
ToolbarItems.handle(({ items, canUndo, canRedo }) => {
    items.push(
        {
            id: "undo",
            label: "Undo",
            icon: "undo",
            action: () => performUndo(),
            enabled: canUndo,
        },
        {
            id: "redo",
            label: "Redo",
            icon: "redo",
            action: () => performRedo(),
            enabled: canRedo,
        }
    )
})

// toolbar.js
function Toolbar({ document }) {
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)
    const [canExport, setCanExport] = useState(true)

    // Collect toolbar items from all plugins
    const items = useMemo(() => {
        const collected = []
        ToolbarItems.call({
            items: collected,
            document,
            canUndo,
            canRedo,
            canExport,
        })
        return collected
    }, [document, canUndo, canRedo, canExport])

    return (
        <div className="toolbar">
            {items.map((item) => (
                <button key={item.id} onClick={item.action} disabled={!item.enabled}>
                    <Icon name={item.icon} />
                    {item.label}
                </button>
            ))}
        </div>
    )
}
```

### Example 5: Distributed Cache Invalidation

```javascript
// server/cache-invalidation.js
import { createEvent } from "../library/local-events"
import { emit, subscribeToEvents } from "./event-bridge"

export const FlushCache = createEvent("FlushCache")

// Add emit method for distributed events
FlushCache.emit = function (...args) {
    // Raise locally first
    FlushCache.raise(...args)

    // Then broadcast to other servers
    emit("FlushCache", ...args)
}

// Subscribe to events from other servers
subscribeToEvents((eventName, ...args) => {
    if (eventName === "FlushCache") {
        FlushCache.raise(...args)
    }
})

// In-memory cache
const cache = new Map()

// Clear cache when FlushCache is raised
FlushCache.handle((cacheKey) => {
    if (cacheKey) {
        cache.delete(cacheKey)
        console.log(`Cache cleared for: ${cacheKey}`)
    } else {
        cache.clear()
        console.log("All caches cleared")
    }
})

// server/api.js
export async function updateUser(userId, data) {
    await db.users.update(userId, data)

    // Invalidate cache on ALL server instances
    FlushCache.emit(`user:${userId}`)

    return db.users.get(userId)
}
```

---

## Production Checklist

Before deploying the event system to production:

-   [ ] **Define all events** in a central `event-definitions.js` file
-   [ ] **Document event contracts** (what data they send/expect)
-   [ ] **Add debouncing** to high-frequency events
-   [ ] **Keep payloads small** - use references, not large data
-   [ ] **Test event cleanup** - ensure handlers are removed on unmount
-   [ ] **Implement error handling** in event handlers
-   [ ] **Set up distributed events** if using multiple servers
-   [ ] **Configure event replay** buffer for robustness
-   [ ] **Monitor event volume** in production
-   [ ] **Log critical events** for debugging
-   [ ] **Add event metrics** (raised count, handler count, timing)

---

## Troubleshooting

### Events Not Firing

**Problem:** Event raised but handlers not called.

**Solutions:**

1. Check event name matches exactly
2. Ensure handler registered before event raised
3. Verify handler not accidentally removed
4. Check for errors in handler code (silently caught)

```javascript
// Debug: Log all event raises
const originalRaise = MyEvent.raise
MyEvent.raise = function (...args) {
    console.log("MyEvent raised:", args)
    return originalRaise.apply(this, args)
}
```

### Memory Leaks

**Problem:** Handlers not cleaned up, component memory grows.

**Solutions:**

1. Always return cleanup function from useEffect
2. Use `useEvent()` hook instead of manual `handle()`
3. Check for circular event chains

```javascript
// ❌ BAD: No cleanup
function MyComponent() {
    useEffect(() => {
        MyEvent.handle(handler) // Never removed!
    }, [])
}

// ✅ GOOD: Cleanup
function MyComponent() {
    useEffect(() => {
        const remove = MyEvent.handle(handler)
        return remove // Cleanup on unmount
    }, [])
}

// ✅ BEST: Use hook
function MyComponent() {
    MyEvent.useEvent(handler, []) // Auto-cleanup
}
```

### Event Storm

**Problem:** Too many events fired rapidly, browser/server overwhelmed.

**Solutions:**

1. Add debouncing with `raiseOnceDelay()`
2. Use deduplication with `raiseOnceDedupe()`
3. Batch updates instead of individual events

```javascript
// ❌ BAD: Event storm
for (let item of items) {
    ItemUpdated.raise(item) // 1000 events!
}

// ✅ GOOD: Debounced
for (let item of items) {
    ItemUpdated.raiseOnceDelay(100, item) // Max 10/second
}

// ✅ BETTER: Single batch event
ItemsBatchUpdated.raise(items)
```

### Handler Execution Order

**Problem:** Handlers execute in wrong order.

**Solutions:**

1. Use event phases (`early`, `late`)
2. Don't rely on handler registration order
3. Use explicit ordering mechanism

```javascript
// Use phases for order
MyEvent.early.handle(firstHandler)
MyEvent.handle(mainHandler)
MyEvent.late.handle(lastHandler)
```

---

## License

This event system can be freely used and adapted for your project.

---

## Support

For questions or issues:

-   File an issue in your project repo
-   Check the examples above
-   Review the API reference

---

**End of Documentation**
