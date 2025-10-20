import { BaseRepository } from "./BaseRepository";
import {
  GET_ALL_FILMSIMS,
  GET_FILMSIM_BY_ID,
} from "../../graphql/queries/getAllFilmSims";
import {
  CREATE_FILMSIM,
  UPDATE_FILMSIM,
  DELETE_FILMSIM,
} from "../../graphql/mutations/filmSims";

export interface FilmSim {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  creator: {
    id: string;
    username: string;
  };
  tags?: Array<{ displayName: string }>;
  settings?: any;
}

export class FilmSimRepository extends BaseRepository<FilmSim> {
  async findAll(filter?: any): Promise<FilmSim[]> {
    const data = await this.executeQuery(GET_ALL_FILMSIMS, { filter });
    return data.listFilmSims || [];
  }

  async findById(id: string): Promise<FilmSim | null> {
    const data = await this.executeQuery(GET_FILMSIM_BY_ID, { id });
    return data.getFilmSim || null;
  }

  async create(data: Partial<FilmSim>): Promise<FilmSim> {
    const result = await this.executeMutation(CREATE_FILMSIM, { input: data });
    return result.createFilmSim;
  }

  async update(id: string, data: Partial<FilmSim>): Promise<FilmSim> {
    const result = await this.executeMutation(UPDATE_FILMSIM, {
      input: { id, ...data },
    });
    return result.updateFilmSim;
  }

  async delete(id: string): Promise<void> {
    await this.executeMutation(DELETE_FILMSIM, { id });
  }
}
