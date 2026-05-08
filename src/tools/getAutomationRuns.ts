import { automationRunsApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetAutomationRunsParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
}

export async function getAutomationRuns(params: GetAutomationRunsParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1 } = params;
  return automationRunsApi.getAutomationRunPage(project_id, { perPage: per_page, page });
}
