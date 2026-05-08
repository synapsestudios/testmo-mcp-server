import { repositoryCasesApi } from "../testmoClient";

export interface GetCaseParams {
  project_id: number;
  case_id: number;
}

/**
 * Retrieves a single test case by ID from a project.
 *
 * The Testmo API has no GET /cases/{id} endpoint. The only way to look up a
 * case is via GET /projects/{project_id}/cases (paginated list). We sort
 * ascending by id and walk pages with per_page=100, stopping as soon as we
 * find the target or the smallest id on a page already exceeds the target
 * (meaning the case does not exist).
 */
export async function getCase(params: GetCaseParams): Promise<unknown> {
  const { project_id, case_id } = params;

  let page = 1;

  while (true) {
    const data = await repositoryCasesApi.getCasesPage(project_id, {
      perPage: 100,
      page,
      sort: "repository_cases:id",
      order: "asc",
    });

    const cases: Array<{ id: number; [key: string]: unknown }> = data.result ?? [];

    if (cases.length === 0) {
      throw new Error(`Test case ${case_id} not found in project ${project_id}`);
    }

    const match = cases.find((c) => c.id === case_id);
    if (match) {
      return match;
    }

    const minId = cases[0].id;
    if (minId > case_id) {
      throw new Error(`Test case ${case_id} not found in project ${project_id}`);
    }

    if (data.next_page == null) {
      throw new Error(`Test case ${case_id} not found in project ${project_id}`);
    }

    page = data.next_page;
  }
}
