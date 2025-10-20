import { BaseRepository } from "./BaseRepository";
import {
  GET_ALL_PRESETS,
  GET_PRESET_BY_ID,
} from "../../graphql/queries/getAllPresets";
import {
  CREATE_PRESET,
  UPDATE_PRESET,
  DELETE_PRESET,
} from "../../graphql/mutations/presets";

export interface Preset {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  creator: {
    id: string;
    username: string;
  };
  tags?: Array<{ displayName: string }>;
}

export class PresetRepository extends BaseRepository<Preset> {
  async findAll(filter?: any): Promise<Preset[]> {
    const data = await this.executeQuery(GET_ALL_PRESETS, { filter });
    return data.listPresets || [];
  }

  async findById(id: string): Promise<Preset | null> {
    const data = await this.executeQuery(GET_PRESET_BY_ID, { id });
    return data.getPreset || null;
  }

  async create(data: Partial<Preset>): Promise<Preset> {
    const result = await this.executeMutation(CREATE_PRESET, { input: data });
    return result.createPreset;
  }

  async update(id: string, data: Partial<Preset>): Promise<Preset> {
    const result = await this.executeMutation(UPDATE_PRESET, {
      input: { id, ...data },
    });
    return result.updatePreset;
  }

  async delete(id: string): Promise<void> {
    await this.executeMutation(DELETE_PRESET, { id });
  }
}
