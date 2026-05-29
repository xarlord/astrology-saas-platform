declare module '@tanstack/query-core' {
  export class QueryClient {
    constructor(config?: Record<string, unknown>);
    getQueryCache(): { getAll(): Array<{ queryKey: unknown; state: Record<string, unknown> }> };
    getMutationCache(): Record<string, unknown>;
    getDefaultOptions(): Record<string, unknown>;
    setDefaultOptions(options: Record<string, unknown>): void;
    setQueryDefaults(queryKey: unknown, options: Record<string, unknown>): void;
    getQueryDefaults(queryKey: unknown): Record<string, unknown>;
    setMutationDefaults(mutationKey: unknown, options: Record<string, unknown>): void;
    getMutationDefaults(mutationKey: unknown): Record<string, unknown> | undefined;
    clear(): void;
    getQueriesData(filters: Record<string, unknown>): Array<[unknown, unknown]>;
    getQueryData(queryKey: unknown): unknown;
    setQueryData(queryKey: unknown, updater: unknown): unknown;
    setQueriesData(filters: Record<string, unknown>, updater: unknown): Array<[unknown, unknown]>;
    invalidateQueries(filters?: Record<string, unknown>): Promise<unknown>;
    refetchQueries(filters?: Record<string, unknown>): Promise<unknown>;
    cancelQueries(filters?: Record<string, unknown>): Promise<void>;
    removeQueries(filters?: Record<string, unknown>): void;
    resetQueries(filters?: Record<string, unknown>): Promise<unknown>;
    isActive(query: Record<string, unknown>): boolean;
    isFetching(filters?: Record<string, unknown>): number;
    isMutating(filters?: Record<string, unknown>): number;
    resumePausedMutations(): Promise<unknown>;
    fetchQuery(options: Record<string, unknown>): Promise<unknown>;
    prefetchQuery(options: Record<string, unknown>): Promise<void>;
    fetchInfiniteQuery(options: Record<string, unknown>): Promise<unknown>;
    prefetchInfiniteQuery(options: Record<string, unknown>): Promise<void>;
  }
}
