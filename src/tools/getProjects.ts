import { projectsApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetProjectsParams {
  per_page?: PerPage;
  page?: number;
}

export async function getProjects(params: GetProjectsParams): Promise<unknown> {
  const { per_page = 50, page = 1 } = params;
  return projectsApi.getProjectPage({ perPage: per_page, page });
}
