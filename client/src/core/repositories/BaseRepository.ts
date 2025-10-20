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
    console.log('Apollo Client:', this.apolloClient);
    
    // Check if Apollo Client is properly initialized
    if (!this.apolloClient) {
      throw new Error('Apollo Client not initialized');
    }
    
    try {
      const result = await this.apolloClient.query({
        query,
        variables,
        fetchPolicy: "cache-and-network",
        errorPolicy: 'all',
      });
      console.log('Query result:', result);
      return result.data;
    } catch (error) {
      console.error('Query execution error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
