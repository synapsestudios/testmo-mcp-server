import { usersApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetProjectUsersParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
}

export async function getProjectUsers(params: GetProjectUsersParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1 } = params;
  return usersApi.getUserPageForProject(project_id, { perPage: per_page, page });
}
