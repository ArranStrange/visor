import React, { useEffect, useCallback, useRef } from "react";

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (...args: T[]) => void | Promise<void>;

/**
 * Event object with methods for raising and listening
 */
export interface EventObject {
  /**
   * Event name identifier
   */
  readonly name: string;

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
   * Add an event handler
   */
  handle(handler: EventHandler): () => void;

  /**
   * Add a handler that only fires once
   */
  handleOnce(handler: EventHandler): void;

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
}

/**
 * Event registry - stores all handlers by event name
 */
const eventRegistry = new Map<string, Set<EventHandler>>();

/**
 * Debounce timers for raiseOnce
 */
const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Creates a new event object
 * Events are memoized - same name returns same event object
 */
const eventCache = new Map<string, EventObject>();

export function createEvent(
  name: string,
  extract?: (args: any[]) => any
): EventObject {
  // Return existing event if already created
  if (eventCache.has(name)) {
    return eventCache.get(name)!;
  }

  const event: EventObject = {
    name,

    raise(...args: any[]) {
      const handlers = eventRegistry.get(name);
      if (!handlers) return;

      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${name}:`, error);
        }
      });
    },

    async raiseAsync(...args: any[]) {
      const handlers = eventRegistry.get(name);
      if (!handlers) return;

      await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            await handler(...args);
          } catch (error) {
            console.error(`Error in async event handler for ${name}:`, error);
          }
        })
      );
    },

    raiseOnce(...args: any[]) {
      const key = `${name}-${JSON.stringify(args)}`;
      const existing = debounceTimers.get(key);

      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        event.raise(...args);
        debounceTimers.delete(key);
      }, 20);

      debounceTimers.set(key, timer);
    },

    raiseOnceDelay(delay: number, ...args: any[]) {
      const key = `${name}-${JSON.stringify(args)}`;
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

    handle(handler: EventHandler): () => void {
      const handlers = eventRegistry.get(name) || new Set();
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

    handleOnce(handler: EventHandler) {
      const wrappedHandler = (...args: any[]) => {
        handler(...args);
        event.handle(wrappedHandler)(); // Remove after first call
      };
      event.handle(wrappedHandler);
    },

    useEvent(handler: EventHandler, deps: React.DependencyList = []) {
      useEffect(() => {
        const cleanup = event.handle(handler);
        return cleanup;
      }, deps);
    },

    useRefresh() {
      const [refreshId, setRefreshId] = React.useState(0);
      const refresh = useCallback(() => {
        setRefreshId((prev) => prev + 1);
      }, []);

      return { id: refreshId, refresh };
    },

    call<T = any>(...args: any[]): T[] {
      const handlers = eventRegistry.get(name);
      if (!handlers) return [];

      const results: T[] = [];
      handlers.forEach((handler) => {
        try {
          const result = handler(...args);
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
      const handlers = eventRegistry.get(name);
      if (!handlers) return [];

      const results = await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            const result = await handler(...args);
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
  };

  eventCache.set(name, event);
  return event;
}

