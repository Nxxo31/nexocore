// NexoCore — Base Tenant Repository
// Repository Pattern con tenant isolation automático

export interface PaginationParams {
  cursor?: string;
  take?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface Filters {
  [key: string]: unknown;
}

export abstract class TenantRepository<T> {
  constructor(protected tenantId: string) {
    if (!tenantId) {
      throw new Error("TenantRepository requires a non-empty tenantId");
    }
  }

  protected abstract get model(): string;

  abstract findMany(filters?: Filters, pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Record<string, unknown>): Promise<T>;
  abstract update(id: string, data: Record<string, unknown>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
