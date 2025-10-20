import { BaseRepository } from "./BaseRepository";
import { GET_ALL_PRESETS } from "../../graphql/queries/getAllPresets";
import { GET_PRESET_BY_SLUG } from "../../graphql/queries/getPresetBySlug";
import { UPDATE_PRESET } from "../../graphql/mutations/updatePreset";
import { DELETE_PRESET } from "../../graphql/mutations/deletePreset";

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
    // Note: This uses slug instead of ID since the API uses slugs
    const data = await this.executeQuery(GET_PRESET_BY_SLUG, { slug: id });
    return data.getPreset || null;
  }

  async create(data: Partial<Preset>): Promise<Preset> {
    // Note: CREATE_PRESET mutation doesn't exist yet, this would need to be implemented
    throw new Error("Create preset functionality not implemented yet");
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
