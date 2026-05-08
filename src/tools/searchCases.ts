import { repositoryCasesApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface SearchCasesParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  folder_id?: string;
  state_id?: string;
  status_id?: string;
  template_id?: string;
  has_automation?: boolean;
}

export async function searchCases(params: SearchCasesParams): Promise<unknown> {
  const {
    project_id,
    per_page = 50,
    page = 1,
    folder_id,
    state_id,
    status_id,
    template_id,
    has_automation,
  } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (folder_id) opts["folderId"] = folder_id;
  if (state_id) opts["stateId"] = state_id;
  if (status_id) opts["statusId"] = status_id;
  if (template_id) opts["templateId"] = template_id;
  if (has_automation !== undefined) opts["hasAutomation"] = has_automation;

  return repositoryCasesApi.getCasesPage(project_id, opts);
}
