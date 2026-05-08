import { fieldsApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetFieldsParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  entity?: string;
}

export async function getFields(params: GetFieldsParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, entity } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (entity) opts["entity"] = entity;

  return fieldsApi.getFieldPage(project_id, opts);
}
