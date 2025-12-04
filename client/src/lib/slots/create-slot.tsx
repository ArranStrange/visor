import React from "react";

/**
 * List of custom props that should not be passed to DOM elements
 * These are application-specific props that components use but shouldn't reach the DOM
 */
const CUSTOM_PROPS = new Set([
  "isOwner",
  "isAdmin",
  "currentUser",
  "preset",
  "filmSim",
  "menuAnchorEl",
  "menuOpen",
  "itemType",
  "itemId",
]);

/**
 * List of component types that are known wrappers and should not receive custom props
 * These components pass all props through to DOM elements
 */
const WRAPPER_COMPONENTS = new Set([
  "Box",
  "Container",
  "Stack",
  "Grid",
  "Paper",
]);

/**
 * Checks if a component is a wrapper that shouldn't receive custom props
 */
function isWrapperComponent(component: React.ReactElement): boolean {
  const type = component.type;

  // If it's a string, it's a DOM element
  if (typeof type === "string") {
    return true;
  }

  // If it's a function component, check its displayName
  if (typeof type === "function") {
    const displayName = (type as any).displayName || type.name;
    return WRAPPER_COMPONENTS.has(displayName);
  }

  // For other types, be conservative and allow props
  return false;
}

/**
 * Filters out custom props that shouldn't be passed to DOM elements
 * Only filters if the component is a known wrapper
 */
function filterCustomPropsForComponent(
  props: Record<string, any>,
  component: React.ReactElement
): Record<string, any> {
  // If component is a wrapper, filter out custom props
  if (isWrapperComponent(component)) {
    const filtered: Record<string, any> = {};
    for (const key in props) {
      if (!CUSTOM_PROPS.has(key)) {
        filtered[key] = props[key];
      }
    }
    return filtered;
  }

  // Otherwise, pass all props through (component will filter what it needs)
  return props;
}

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

      // Filter items by condition if provided
      const filteredItems = items.filter((item) => {
        if (item.condition) {
          return item.condition(props);
        }
        return true;
      });

      // Render components with props
      const renderedComponents = filteredItems.map((item) => {
        // Filter custom props only for wrapper components
        const filteredProps = filterCustomPropsForComponent(
          props,
          item.component
        );

        // Merge props: component's original props first, then filtered slot props
        // This allows components to override slot props if needed
        const mergedProps = {
          ...item.component.props,
          ...filteredProps,
        };
        return React.cloneElement(item.component, {
          key: item.id,
          ...mergedProps,
        });
      });

      const content = (
        <>
          {children}
          {renderedComponents}
        </>
      );

      if (Container) {
        // If Container is a string (DOM element type), don't pass custom props
        if (typeof Container === "string") {
          return React.createElement(Container, {}, content);
        }
        // If Container is a component, pass it as-is (components should filter their own props)
        return <Container>{content}</Container>;
      }

      return <>{content}</>;
    },

    useItems(): SlotItem[] {
      // Use state to track items and trigger re-renders
      const [items, setItems] = React.useState<SlotItem[]>(() => {
        const initialItems = slotRegistry.get(name) || [];
        return initialItems;
      });

      // Subscribe to slot changes
      React.useEffect(() => {
        // Get initial items
        const currentItems = slotRegistry.get(name) || [];
        setItems(currentItems);

        // Set up listener for changes
        if (!slotListeners.has(name)) {
          slotListeners.set(name, new Set());
        }
        const listeners = slotListeners.get(name)!;

        const updateItems = () => {
          const newItems = [...(slotRegistry.get(name) || [])];
          // console.log(
          //   `Slot "${name}" changed! Updating to ${newItems.length} items`
          // );
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
