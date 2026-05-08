import { milestonesApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetMilestonesParams {
  project_id: number;
  per_page?: PerPage;
  page?: number;
  is_completed?: boolean;
  parent_id?: string;
  type_id?: string;
}

export async function getMilestones(params: GetMilestonesParams): Promise<unknown> {
  const { project_id, per_page = 50, page = 1, is_completed, parent_id, type_id } = params;

  const opts: Record<string, unknown> = { perPage: per_page, page };
  if (is_completed !== undefined) opts["isCompleted"] = is_completed;
  if (parent_id) opts["parentId"] = parent_id;
  if (type_id) opts["typeId"] = type_id;

  return milestonesApi.getMilestonePage(project_id, opts);
}
