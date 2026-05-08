import { automationRunsApi } from "../testmoClient";

export interface AutomationTest {
  key: string;
  name: string;
  status: string;
  folder: string;
  duration?: number;
  message?: string;
}

export interface SubmitAutomationResultParams {
  project_id: number;
  run_name: string;
  source: string;
  tests: AutomationTest[];
  milestone_id?: number;
}

/**
 * Submits automation results in a single call by wrapping the full
 * create-run → create-thread → append-tests → complete-thread → complete-run lifecycle.
 */
export async function submitAutomationResult(
  params: SubmitAutomationResultParams
): Promise<unknown> {
  const { project_id, run_name, source, tests, milestone_id } = params;

  const runBody: Record<string, unknown> = { name: run_name, source };
  if (milestone_id !== undefined) runBody["milestone_id"] = milestone_id;

  const run = await automationRunsApi.createAutomationRun(project_id, runBody);
  const thread = await automationRunsApi.createAutomationRunThread(run.id, {});
  await automationRunsApi.appendToAutomationRunThread(thread.id, { tests });
  await automationRunsApi.completeAutomationRunThread(thread.id, {});
  await automationRunsApi.completeAutomationRun(run.id, {});

  return {
    run_id: run.id,
    thread_id: thread.id,
    tests_submitted: tests.length,
  };
}
