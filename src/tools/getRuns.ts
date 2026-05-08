import { runsApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetRunsParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  is_closed?: boolean;
  milestone_id?: number;
}

export async function getRuns(params: GetRunsParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, is_closed, milestone_id } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (is_closed !== undefined) opts["isClosed"] = is_closed;
  if (milestone_id !== undefined) opts["milestoneId"] = milestone_id;

  return runsApi.getRunPage(project_id, opts);
}
