import { BaseRepository } from "./BaseRepository";
import { GET_ALL_FILMSIMS } from "../../graphql/queries/getAllFilmSims";
import { GET_FILMSIM_BY_SLUG } from "../../graphql/queries/getFilmSimBySlug";
import { UPDATE_FILMSIM } from "../../graphql/mutations/updateFilmSim";
import { DELETE_FILMSIM } from "../../graphql/mutations/deleteFilmSim";

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

export interface PaginatedFilmSims {
  filmSims: FilmSim[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export class FilmSimRepository extends BaseRepository<FilmSim> {
  async findAll(filter?: any): Promise<FilmSim[]> {
    // For backward compatibility, fetch first page with a large limit
    const data = await this.executeQuery(GET_ALL_FILMSIMS, {
      filter,
      page: 1,
      limit: 1000,
    });
    return data.listFilmSims?.filmSims || [];
  }

  async findPaginated(
    page: number = 1,
    limit: number = 20,
    filter?: any
  ): Promise<PaginatedFilmSims> {
    const data = await this.executeQuery(GET_ALL_FILMSIMS, {
      filter,
      page,
      limit,
    });
    return (
      data.listFilmSims || {
        filmSims: [],
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: page,
        totalPages: 0,
      }
    );
  }

  async findById(id: string): Promise<FilmSim | null> {
    // Note: This uses slug instead of ID since the API uses slugs
    const data = await this.executeQuery(GET_FILMSIM_BY_SLUG, { slug: id });
    return data.getFilmSim || null;
  }

  async create(data: Partial<FilmSim>): Promise<FilmSim> {
    // Note: CREATE_FILMSIM mutation doesn't exist yet, this would need to be implemented
    throw new Error("Create film sim functionality not implemented yet");
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
