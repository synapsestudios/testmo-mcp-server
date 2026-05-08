import { repositoryCasesApi } from "../testmoClient";

export interface CaseInput {
  name: string;
  folder_id?: number | null;
  template_id?: number | null;
  state_id?: number | null;
  estimate?: number | null;
  tags?: string[] | null;
  issues?: number[] | null;
  automation_links?: number[];
}

export interface CreateCasesParams {
  project_id: number;
  cases: CaseInput[];
}

export async function createCases(params: CreateCasesParams): Promise<unknown> {
  const { project_id, cases } = params;
  return repositoryCasesApi.createCases(project_id, { cases });
}
