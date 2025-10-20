// Strategy pattern for different content loading approaches
export interface ContentLoadingStrategy {
  loadContent(filter?: any): Promise<any[]>;
  getStrategyName(): string;
}

export class PresetLoadingStrategy implements ContentLoadingStrategy {
  constructor(private presetRepository: any) {}

  async loadContent(filter?: any): Promise<any[]> {
    return await this.presetRepository.findAll(filter);
  }

  getStrategyName(): string {
    return "preset";
  }
}

export class FilmSimLoadingStrategy implements ContentLoadingStrategy {
  constructor(private filmSimRepository: any) {}

  async loadContent(filter?: any): Promise<any[]> {
    return await this.filmSimRepository.findAll(filter);
  }

  getStrategyName(): string {
    return "filmSim";
  }
}

export class CombinedLoadingStrategy implements ContentLoadingStrategy {
  constructor(private presetRepository: any, private filmSimRepository: any) {}

  async loadContent(filter?: any): Promise<any[]> {
    const [presets, filmSims] = await Promise.all([
      this.presetRepository.findAll(filter),
      this.filmSimRepository.findAll(filter),
    ]);

    return [...presets, ...filmSims];
  }

  getStrategyName(): string {
    return "combined";
  }
}

// Strategy context
export class ContentLoadingContext {
  private strategy: ContentLoadingStrategy;

  constructor(strategy: ContentLoadingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ContentLoadingStrategy): void {
    this.strategy = strategy;
  }

  async loadContent(filter?: any): Promise<any[]> {
    return await this.strategy.loadContent(filter);
  }

  getCurrentStrategy(): string {
    return this.strategy.getStrategyName();
  }
}
