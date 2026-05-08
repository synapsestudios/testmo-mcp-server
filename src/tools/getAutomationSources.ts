import { automationSourcesApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetAutomationSourcesParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  is_retired?: boolean;
}

export async function getAutomationSources(params: GetAutomationSourcesParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, is_retired } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (is_retired !== undefined) opts["isRetired"] = is_retired;

  return automationSourcesApi.getAutomationSourcePage(project_id, opts);
}
