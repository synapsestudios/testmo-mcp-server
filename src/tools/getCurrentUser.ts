import { userApi } from "../testmoClient";

export async function getCurrentUser(): Promise<unknown> {
  return userApi.getCurrentUser();
}
