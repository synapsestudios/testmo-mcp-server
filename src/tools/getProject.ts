import { projectsApi } from "../testmoClient";

export interface GetProjectParams {
  project_id: number;
}

export async function getProject(params: GetProjectParams): Promise<unknown> {
  const { project_id } = params;
  return projectsApi.getProject(project_id);
}
