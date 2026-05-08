import { runResultsApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetRunResultsParams {
  run_id: number;
  per_page?: PerPage;
  page?: number;
  status_id?: string;
  get_latest_result?: boolean;
  assignee_id?: string;
}

export async function getRunResults(params: GetRunResultsParams): Promise<unknown> {
  const { run_id, per_page = 100, page = 1, status_id, get_latest_result, assignee_id } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (status_id) opts["statusId"] = status_id;
  if (get_latest_result !== undefined) opts["getLatestResult"] = get_latest_result;
  if (assignee_id) opts["assigneeId"] = assignee_id;

  return runResultsApi.getRunResultPage(run_id, opts);
}
