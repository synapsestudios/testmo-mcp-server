import { foldersApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetFoldersParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  parent_id?: number;
  name?: string;
}

export async function getFolders(params: GetFoldersParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, parent_id, name } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (parent_id !== undefined) opts["parentId"] = parent_id;
  if (name) opts["name"] = name;

  return foldersApi.getFoldersPage(project_id, opts);
}
