import { foldersApi } from "../testmoClient";

export interface FolderInput {
  name: string;
  parent_id?: number | null;
  docs?: string | null;
  display_order?: number | null;
}

export interface CreateFoldersParams {
  project_id: number;
  folders: FolderInput[];
}

export async function createFolders(params: CreateFoldersParams): Promise<unknown> {
  const { project_id, folders } = params;
  return foldersApi.createFolders(project_id, { folders });
}
