import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  itemPerPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).max(255).optional(),
});

export class Pagination {
  page?: number;
  itemPerPage?: number;
  search?: string;
}
