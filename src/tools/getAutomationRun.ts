import { automationRunsApi } from "../testmoClient";

export interface GetAutomationRunParams {
  automation_run_id: number;
}

export async function getAutomationRun(params: GetAutomationRunParams): Promise<unknown> {
  const { automation_run_id } = params;
  return automationRunsApi.getAutomationRun(automation_run_id);
}
