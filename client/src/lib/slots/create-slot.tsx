import React from "react";

/**
 * Slot item stored in the slot registry
 */
interface SlotItem {
  component: React.ReactElement;
  priority: number;
  id: string;
  condition?: (context: any) => boolean;
}

/**
 * Slot registry - stores all plugged components by slot name
 */
const slotRegistry = new Map<string, SlotItem[]>();

/**
 * Listeners for slot changes - used to trigger re-renders
 */
const slotListeners = new Map<string, Set<() => void>>();

/**
 * Notify all listeners that a slot has changed
 */
function notifySlotChange(slotName: string) {
  const listeners = slotListeners.get(slotName);
  if (listeners) {
    listeners.forEach((listener) => listener());
  }
}

/**
 * Slot object with methods for plugging and rendering
 */
export interface SlotObject {
  /**
   * Slot name identifier
   */
  readonly name: string;

  /**
   * Register a component at module level (most common pattern)
   * Runs once when the module loads
   */
  plug(component: React.ReactElement, priority?: number): void;

  /**
   * Register a component using React hook (for dynamic content)
   * Runs during component lifecycle
   */
  usePlug(component: React.ReactElement, deps?: React.DependencyList): void;

  /**
   * React component that renders all plugged components
   */
  Slot: React.FC<SlotProps>;

  /**
   * Get all items plugged into this slot
   */
  useItems(): SlotItem[];

  /**
   * Create a sub-typed slot (namespaced)
   */
  subType(subType: string): SlotObject;
}

/**
 * Props passed to Slot component
 */
export interface SlotProps {
  /**
   * Props to pass to all plugged components
   */
  [key: string]: any;

  /**
   * Custom container component
   */
  Container?: React.ComponentType<any>;

  /**
   * Children to render alongside plugged content
   */
  children?: React.ReactNode;
}

/**
 * Creates a new slot object
 * Slots are memoized - same name returns same slot object
 */
const slotCache = new Map<string, SlotObject>();

export function createSlot(name: string): SlotObject {
  // Return existing slot if already created
  if (slotCache.has(name)) {
    return slotCache.get(name)!;
  }

  const slot: SlotObject = {
    name,

    plug(component: React.ReactElement, priority: number = 100) {
      const items = slotRegistry.get(name) || [];
      const id = `${name}-${Date.now()}-${Math.random()}`;

      // Extract condition from component props
      const condition = (component.props as any)?.if;

      items.push({
        component,
        priority,
        id,
        condition,
      });

      // Sort by priority (lower = first)
      items.sort((a, b) => a.priority - b.priority);

      slotRegistry.set(name, items);

      // Notify listeners that the slot has changed
      notifySlotChange(name);

      console.log(
        `🔌 Plugged into slot "${name}" (priority: ${priority}, total items: ${items.length})`
      );
    },

    usePlug(component: React.ReactElement, deps: React.DependencyList = []) {
      React.useEffect(() => {
        const items = slotRegistry.get(name) || [];
        const id = `${name}-${Date.now()}-${Math.random()}`;
        const condition = (component.props as any)?.if;

        items.push({
          component,
          priority: (component.props as any)?.priority || 100,
          id,
          condition,
        });

        items.sort((a, b) => a.priority - b.priority);
        slotRegistry.set(name, items);

        // Notify listeners that the slot has changed
        notifySlotChange(name);

        // Cleanup on unmount
        return () => {
          const currentItems = slotRegistry.get(name) || [];
          const filtered = currentItems.filter((item) => item.id !== id);
          slotRegistry.set(name, filtered);

          // Notify listeners that the slot has changed
          notifySlotChange(name);
        };
      }, deps);
    },

    Slot: ({ Container, children, ...props }) => {
      const items = slot.useItems();

      // Debug logging
      React.useEffect(() => {
        console.log(
          `🎯 Slot "${name}" rendering with ${items.length} items:`,
          items.map((i) => i.id)
        );
      }, [items.length, name]);

      // Filter items by condition if provided
      const filteredItems = items.filter((item) => {
        if (item.condition) {
          return item.condition(props);
        }
        return true;
      });

      // Render components with props
      const renderedComponents = filteredItems.map((item) => {
        return React.cloneElement(item.component, {
          key: item.id,
          ...props,
          ...item.component.props,
        });
      });

      const content = (
        <>
          {children}
          {renderedComponents}
        </>
      );

      if (Container) {
        return <Container>{content}</Container>;
      }

      return <>{content}</>;
    },

    useItems(): SlotItem[] {
      // Use state to track items and trigger re-renders
      const [items, setItems] = React.useState<SlotItem[]>(() => {
        const initialItems = slotRegistry.get(name) || [];
        console.log(
          `📦 useItems() initial state for "${name}": ${initialItems.length} items`
        );
        return initialItems;
      });

      // Subscribe to slot changes
      React.useEffect(() => {
        // Get initial items
        const currentItems = slotRegistry.get(name) || [];
        console.log(
          `🔄 useItems() effect for "${name}": ${currentItems.length} items in registry`
        );
        setItems(currentItems);

        // Set up listener for changes
        if (!slotListeners.has(name)) {
          slotListeners.set(name, new Set());
        }
        const listeners = slotListeners.get(name)!;

        const updateItems = () => {
          const newItems = [...(slotRegistry.get(name) || [])];
          console.log(
            `🔔 Slot "${name}" changed! Updating to ${newItems.length} items`
          );
          setItems(newItems);
        };

        listeners.add(updateItems);

        // Cleanup
        return () => {
          listeners.delete(updateItems);
          if (listeners.size === 0) {
            slotListeners.delete(name);
          }
        };
      }, [name]);

      return items;
    },

    subType(subType: string): SlotObject {
      const subTypeName = `${name}.${subType}`;
      return createSlot(subTypeName);
    },
  };

  slotCache.set(name, slot);
  return slot;
}
