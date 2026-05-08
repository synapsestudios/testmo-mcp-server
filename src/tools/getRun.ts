import { runsApi } from "../testmoClient";

export interface GetRunParams {
  run_id: number;
}

export async function getRun(params: GetRunParams): Promise<unknown> {
  const { run_id } = params;
  return runsApi.getRun(run_id);
}
