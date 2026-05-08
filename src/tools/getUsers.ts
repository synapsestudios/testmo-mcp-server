import { usersApi } from "../testmoClient";

export type PerPage = 15 | 25 | 50 | 100;

export interface GetUsersParams {
  per_page?: PerPage;
  page?: number;
}

export async function getUsers(params: GetUsersParams): Promise<unknown> {
  const { per_page = 50, page = 1 } = params;
  return usersApi.getUserPage({ perPage: per_page, page });
}
