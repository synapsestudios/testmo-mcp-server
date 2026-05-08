import { foldersApi } from "../testmoClient";

export interface DeleteFoldersParams {
  project_id: number;
  ids: number[];
}

export async function deleteFolders(params: DeleteFoldersParams): Promise<unknown> {
  const { project_id, ids } = params;
  await foldersApi.deleteFolders(project_id, { ids });
  return { deleted: ids.length, ids };
}
