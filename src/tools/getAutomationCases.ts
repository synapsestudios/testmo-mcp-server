import { automationCasesApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetAutomationCasesParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  source_id?: number;
  status?: string;
  name?: string;
  folder?: string;
}

export async function getAutomationCases(params: GetAutomationCasesParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, source_id, status, name, folder } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (source_id !== undefined) opts["sourceId"] = source_id;
  if (status) opts["status"] = status;
  if (name) opts["name"] = name;
  if (folder) opts["folder"] = folder;

  return automationCasesApi.getAutomationCasePage(project_id, opts);
}
