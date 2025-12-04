import React, { useEffect, useReducer } from "react";

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (...args: T[]) => void | Promise<void>;

/**
 * Event options for createEvent
 */
export interface EventOptions {
  /**
   * Extract function for return values from call/callAsync
   */
  extract?: (args: any[]) => any;
  /**
   * Whether event is async (for callAsync)
   */
  isAsync?: boolean;
  /**
   * Enable early/late phases
   */
  extended?: boolean;
  /**
   * Expose custom method name or object with name/transform
   */
  expose?: string | { name: string; transform?: (...args: any[]) => any };
  /**
   * Transform parameters before handlers
   */
  parameters?: (...args: any[]) => any[];
}

/**
 * Event object with methods for raising and listening
 */
export interface EventObject {
  /**
   * Event name identifier
   */
  readonly name: string;
  /**
   * Event name for hierarchical events
   */
  readonly eventName: string;

  /**
   * Raise the event immediately
   */
  raise(...args: any[]): void;

  /**
   * Raise the event asynchronously (waits for all handlers)
   */
  raiseAsync(...args: any[]): Promise<void>;

  /**
   * Raise the event once (debounced, 20ms)
   */
  raiseOnce(...args: any[]): void;

  /**
   * Raise the event with custom debounce delay
   */
  raiseOnceDelay(delay: number, ...args: any[]): void;

  /**
   * Raise event with deduplication by key function
   */
  raiseOnceDedupe(keyFn: (...args: any[]) => string, ...args: any[]): void;

  /**
   * Raise on next tick (setTimeout 0)
   */
  raiseLater(...args: any[]): void;

  /**
   * Raise in React transition (React 18+)
   */
  fireInTransition(...args: any[]): void;

  /**
   * Add an event handler
   */
  handle(handler: EventHandler): () => void;

  /**
   * Add a handler that only fires once
   */
  handleOnce(handler: EventHandler): () => void;

  /**
   * Add named handler (replaces previous with same id)
   */
  handleId(id: string, handler: EventHandler): () => void;

  /**
   * React hook to listen to the event
   */
  useEvent(handler: EventHandler, deps?: React.DependencyList): void;

  /**
   * React hook that returns a refresh function
   */
  useRefresh(): { id: number; refresh: () => void };

  /**
   * Call all handlers and collect return values
   */
  call<T = any>(...args: any[]): T[];

  /**
   * Call all handlers asynchronously and collect return values
   */
  callAsync<T = any>(...args: any[]): Promise<T[]>;

  /**
   * Wait for event to be raised (returns promise)
   */
  wait(timeout?: number): Promise<any[]>;

  /**
   * Async iterator over event emissions
   */
  iterateEvents(): AsyncGenerator<any[], void, unknown>;

  /**
   * Property that returns a function to raise the event
   */
  readonly invoke: (...args: any[]) => void;

  /**
   * Create sub-event or access hierarchical event
   */
  (subName: string): EventObject;

  /**
   * Early phase event (if extended: true)
   */
  early?: EventObject;
  /**
   * Late phase event (if extended: true)
   */
  late?: EventObject;
  /**
   * Alias for early
   */
  before?: EventObject;
  /**
   * Alias for late
   */
  after?: EventObject;
}

/**
 * Event registry - stores all handlers by event name
 */
const eventRegistry = new Map<string, Set<EventHandler>>();

/**
 * Named handler registry for handleId
 */
const handlerMap = new Map<string, Map<string, () => void>>();

/**
 * Debounce timers for raiseOnce
 */
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Dedupe cache for raiseOnceDedupe
 */
const dedupeCache = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Creates a new event object
 * Events are memoized - same name returns same event object
 */
const eventCache = new Map<string, EventObject>();

export function createEvent(
  name: string,
  options?: EventOptions | ((args: any[]) => any)
): EventObject {
  // Parse options
  const config: EventOptions =
    typeof options === "function" ? { extract: options } : options || {};

  const {
    extract = null,
    extended = false,
    expose = null,
    parameters = null,
  } = config;

  // Return existing event if already created
  if (eventCache.has(name)) {
    return eventCache.get(name)!;
  }

  // Helper to get handlers for this event
  const getHandlers = () => eventRegistry.get(name) || new Set();

  // Helper to process args with parameters transform
  const processArgs = (...args: any[]) => {
    return parameters ? parameters(...args) : args;
  };

  const event: EventObject = {
    name,
    eventName: name,

    raise(...args: any[]) {
      const processedArgs = processArgs(...args);
      const handlers = getHandlers();
      if (!handlers || handlers.size === 0) return;

      handlers.forEach((handler) => {
        try {
          handler(...processedArgs);
        } catch (error) {
          console.error(`Error in event handler for ${name}:`, error);
        }
      });
    },

    async raiseAsync(...args: any[]) {
      const processedArgs = processArgs(...args);
      const handlers = getHandlers();
      if (!handlers || handlers.size === 0) return;

      await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            await handler(...processedArgs);
          } catch (error) {
            console.error(`Error in async event handler for ${name}:`, error);
          }
        })
      );
    },

    raiseOnce(...args: any[]) {
      return event.raiseOnceDelay(20, ...args);
    },

    raiseOnceDelay(delay: number, ...args: any[]) {
      const key = name;
      const existing = debounceTimers.get(key);

      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        event.raise(...args);
        debounceTimers.delete(key);
      }, delay);

      debounceTimers.set(key, timer);
    },

    raiseOnceDedupe(keyFn: (...args: any[]) => string, ...args: any[]) {
      const key = keyFn(...args);
      const existing = dedupeCache.get(key);

      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        event.raise(...args);
        dedupeCache.delete(key);
      }, 20);

      dedupeCache.set(key, timer);
    },

    raiseLater(...args: any[]) {
      setTimeout(() => event.raise(...args), 0);
    },

    fireInTransition(...args: any[]) {
      if (typeof React !== "undefined" && (React as any).startTransition) {
        (React as any).startTransition(() => {
          event.raise(...args);
        });
      } else {
        event.raise(...args);
      }
    },

    handle(handler: EventHandler): () => void {
      const handlers = getHandlers();
      handlers.add(handler);
      eventRegistry.set(name, handlers);

      // Return cleanup function
      return () => {
        const currentHandlers = eventRegistry.get(name);
        if (currentHandlers) {
          currentHandlers.delete(handler);
        }
      };
    },

    handleOnce(handler: EventHandler): () => void {
      const wrappedHandler = (...args: any[]) => {
        remove();
        return handler(...args);
      };
      const remove = event.handle(wrappedHandler);
      return remove;
    },

    handleId(id: string, handler: EventHandler): () => void {
      const eventHandlerMap = handlerMap.get(name) || new Map();
      if (eventHandlerMap.has(id)) {
        const remove = eventHandlerMap.get(id)!;
        remove();
      }
      const remove = event.handle(handler);
      eventHandlerMap.set(id, remove);
      handlerMap.set(name, eventHandlerMap);
      return remove;
    },

    useEvent(handler: EventHandler, deps: React.DependencyList = []) {
      useEffect(() => {
        const cleanup = event.handle(handler);
        return cleanup;
      }, deps);
    },

    useRefresh() {
      const [refreshId, setRefreshId] = useReducer((x) => x + 1, 0);

      useEffect(() => {
        const remove = event.handle(() => {
          setRefreshId();
        });
        return remove;
      }, []);

      return { id: refreshId, refresh: setRefreshId };
    },

    call<T = any>(...args: any[]): T[] {
      const processedArgs = processArgs(...args);
      const handlers = getHandlers();
      if (!handlers || handlers.size === 0) return [];

      const results: T[] = [];
      handlers.forEach((handler) => {
        try {
          const result = handler(...processedArgs);
          if (result !== undefined) {
            results.push(result as T);
          }
        } catch (error) {
          console.error(`Error in event handler for ${name}:`, error);
        }
      });

      if (extract) {
        return [extract(results) as T];
      }

      return results;
    },

    async callAsync<T = any>(...args: any[]): Promise<T[]> {
      const processedArgs = processArgs(...args);
      const handlers = getHandlers();
      if (!handlers || handlers.size === 0) return [];

      const results = await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            const result = await handler(...processedArgs);
            return result as T;
          } catch (error) {
            console.error(`Error in async event handler for ${name}:`, error);
            return undefined;
          }
        })
      );

      const filtered = results.filter((r) => r !== undefined) as T[];

      if (extract) {
        return [extract(filtered) as T];
      }

      return filtered;
    },

    wait(timeout = 0): Promise<any[]> {
      return new Promise((resolve, reject) => {
        const timer =
          timeout > 0
            ? setTimeout(() => reject(new Error("Timeout")), timeout)
            : null;

        event.handleOnce((...args: any[]) => {
          if (timer) clearTimeout(timer);
          resolve(args);
        });
      });
    },

    async *iterateEvents(): AsyncGenerator<any[], void, unknown> {
      const queue: any[][] = [];
      let resolve: ((value: any[]) => void) | null = null;

      const remove = event.handle((...args: any[]) => {
        if (resolve) {
          resolve(args);
          resolve = null;
        } else {
          queue.push(args);
        }
      });

      try {
        while (true) {
          if (queue.length > 0) {
            yield queue.shift()!;
          } else {
            yield await new Promise<any[]>((r) => {
              resolve = r;
            });
          }
        }
      } finally {
        remove();
      }
    },

    get invoke() {
      return (...args: any[]) => event.raise(...args);
    },
  } as EventObject;

  // Hierarchical events support - make event callable
  const createSubEvent = (subName: string): EventObject => {
    const subEventName = `${name}.${subName}`;
    return createEvent(subEventName, config);
  };

  // Extended phases
  if (extended) {
    event.early = createEvent(`${name}.early`, config);
    event.late = createEvent(`${name}.late`, config);
    event.before = event.early;
    event.after = event.late;
  }

  // Expose custom method
  if (expose) {
    const exposeName = typeof expose === "string" ? expose : expose.name;
    const exposeTransform =
      typeof expose === "object" ? expose.transform : null;

    (event as any)[exposeName] = (...args: any[]) => {
      const transformed = exposeTransform ? exposeTransform(...args) : args;
      event.raise(...transformed);
    };
  }

  // Create a callable function that also has all event properties
  // Use Proxy to make it callable while preserving all properties
  const callableFunction = (subName: string) => createSubEvent(subName);

  // Copy all properties from event to the function (except read-only ones)
  const callableEvent = callableFunction as any;
  for (const key in event) {
    if (
      key !== "name" &&
      key !== "length" &&
      key !== "prototype" &&
      key !== "caller" &&
      key !== "arguments"
    ) {
      try {
        callableEvent[key] = (event as any)[key];
      } catch (e) {
        // Ignore read-only properties
      }
    }
  }

  // Use Proxy to handle property access that might not have been copied
  const proxiedEvent = new Proxy(callableEvent, {
    get: (target, prop) => {
      // First check if it's on the target (the function with copied properties)
      if (prop in target) {
        return target[prop];
      }
      // Then check the original event object
      if (prop in event) {
        return (event as any)[prop];
      }
      // Fall back to function properties
      return (target as any)[prop];
    },
    set: (target, prop, value) => {
      // Set on the event object
      (event as any)[prop] = value;
      // Also try to set on target if possible
      try {
        target[prop] = value;
      } catch (e) {
        // Ignore if read-only
      }
      return true;
    },
  }) as EventObject;

  eventCache.set(name, proxiedEvent);
  return proxiedEvent;
}
