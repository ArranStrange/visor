import { IDataRepository } from "../interfaces";
import { ApolloClient } from "@apollo/client";

export abstract class BaseRepository<T> implements IDataRepository<T> {
  constructor(protected apolloClient: ApolloClient<any>) {}

  abstract findAll(filter?: any): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;

  protected async executeQuery(query: any, variables?: any): Promise<any> {
    console.log('Executing query:', query);
    console.log('Variables:', variables);
    
    try {
      const result = await this.apolloClient.query({
        query,
        variables,
        fetchPolicy: "cache-and-network",
      });
      console.log('Query result:', result);
      return result.data;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  protected async executeMutation(
    mutation: any,
    variables?: any
  ): Promise<any> {
    const result = await this.apolloClient.mutate({
      mutation,
      variables,
    });
    return result.data;
  }
}
