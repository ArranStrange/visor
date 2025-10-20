import React from "react";
import { PresetCard } from "../../components/cards/PresetCard";
import { FilmSimCard } from "../../components/cards/FilmSimCard";
import { BuyMeACoffeeCard } from "../../components/ui/BuyMeACoffeeCard";

// Component factory following Factory Pattern and OCP
export interface ComponentFactory {
  createComponent(type: string, props: any): React.ReactElement;
}

export class ContentCardFactory implements ComponentFactory {
  private componentMap: Map<string, React.ComponentType<any>> = new Map();

  constructor() {
    this.registerComponent("preset", PresetCard);
    this.registerComponent("film", FilmSimCard);
    this.registerComponent("buymeacoffee", BuyMeACoffeeCard);
  }

  registerComponent(type: string, component: React.ComponentType<any>): void {
    this.componentMap.set(type, component);
  }

  createComponent(type: string, props: any): React.ReactElement {
    const Component = this.componentMap.get(type);
    if (!Component) {
      throw new Error(`Component type ${type} not registered`);
    }
    return React.createElement(Component, props);
  }
}

// Abstract factory for different content types
export abstract class AbstractContentFactory {
  abstract createCardFactory(): ComponentFactory;
  abstract createDataService(): any;
  abstract createFilterService(): any;
}

export class PresetContentFactory extends AbstractContentFactory {
  createCardFactory(): ComponentFactory {
    return new ContentCardFactory();
  }

  createDataService(): any {
    // Return preset-specific data service
    return null; // Implementation would go here
  }

  createFilterService(): any {
    // Return preset-specific filter service
    return null; // Implementation would go here
  }
}

export class FilmSimContentFactory extends AbstractContentFactory {
  createCardFactory(): ComponentFactory {
    return new ContentCardFactory();
  }

  createDataService(): any {
    // Return film sim-specific data service
    return null; // Implementation would go here
  }

  createFilterService(): any {
    // Return film sim-specific filter service
    return null; // Implementation would go here
  }
}
