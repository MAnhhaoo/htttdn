export type GetOptionsParams<T> = {
  limit: number;
  select: string;
} & Partial<T>;

export interface Options<T> {
  getOptions(params: GetOptionsParams<T>);
}
