import { repositoryCasesApi } from "../testmoClient";

export interface DeleteCasesParams {
  project_id: number;
  ids: number[];
}

export async function deleteCases(params: DeleteCasesParams): Promise<unknown> {
  const { project_id, ids } = params;
  await repositoryCasesApi.deleteCases(project_id, { ids });
  return { deleted: ids.length, ids };
}
