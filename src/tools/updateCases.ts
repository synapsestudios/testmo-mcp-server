import { repositoryCasesApi } from "../testmoClient";

export interface UpdateCasesParams {
  project_id: number;
  ids: number[];
  name?: string | null;
  folder_id?: number | null;
  state_id?: number | null;
  status_id?: number | null;
  estimate?: number | null;
  tags?: string[] | null;
  issues?: number[] | null;
  automation_links?: number[];
}

export async function updateCases(params: UpdateCasesParams): Promise<unknown> {
  const { project_id, ...body } = params;
  return repositoryCasesApi.updateCases(project_id, body);
}
