const {
  ApiClient,
  RepositoryCasesApi,
  FoldersApi,
  RunsApi,
  RunResultsApi,
  MilestonesApi,
  AutomationRunsApi,
  AutomationCasesApi,
  AutomationSourcesApi,
  ProjectsApi,
  UserApi,
  UsersApi,
  FieldsApi,
} = require("@testmo/testmo-api");

const baseURL = process.env.TESTMO_BASE_URL;
const token = process.env.TESTMO_API_TOKEN;

if (!baseURL) {
  console.error("TESTMO_BASE_URL environment variable is not set");
  process.exit(1);
}

if (!token) {
  console.error("TESTMO_API_TOKEN environment variable is not set");
  process.exit(1);
}

const apiClient = new ApiClient(baseURL);
apiClient.authentications["bearerAuth"].accessToken = token;

export const repositoryCasesApi: any = new RepositoryCasesApi(apiClient);
export const foldersApi: any = new FoldersApi(apiClient);
export const runsApi: any = new RunsApi(apiClient);
export const runResultsApi: any = new RunResultsApi(apiClient);
export const milestonesApi: any = new MilestonesApi(apiClient);
export const automationRunsApi: any = new AutomationRunsApi(apiClient);
export const automationCasesApi: any = new AutomationCasesApi(apiClient);
export const automationSourcesApi: any = new AutomationSourcesApi(apiClient);
export const projectsApi: any = new ProjectsApi(apiClient);
export const userApi: any = new UserApi(apiClient);
export const usersApi: any = new UsersApi(apiClient);
export const fieldsApi: any = new FieldsApi(apiClient);

// `ApiClient.callApi` (in @testmo/testmo-api) rejects with a plain object —
// `{ status, statusText, body, response, error }` — rather than an `Error`,
// for both HTTP-level failures (bad token, bad project id, ...) and
// network-level ones (bad host). Unwrap that shape into a readable message
// instead of letting it fall through to `String(err)`, which just yields
// the literal text "[object Object]".
interface TestmoApiErrorShape {
  status?: number;
  statusText?: string;
  body?: unknown;
  error?: unknown;
}

function isTestmoApiErrorShape(value: unknown): value is TestmoApiErrorShape {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Error) &&
    ("status" in value || "statusText" in value || "body" in value || "error" in value)
  );
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isTestmoApiErrorShape(error)) {
    const { body } = error;
    const bodyMessage =
      body && typeof body === "object"
        ? ((body as Record<string, unknown>).message as string | undefined) ??
          ((body as Record<string, unknown>).error as string | undefined)
        : typeof body === "string"
        ? body
        : undefined;

    const statusPart = [error.status, error.statusText].filter(Boolean).join(" ");
    if (statusPart || bodyMessage) {
      return [statusPart, bodyMessage].filter(Boolean).join(": ");
    }

    if (error.error instanceof Error) {
      return error.error.message;
    }

    if (error.error !== undefined) {
      return String(error.error);
    }
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }

  return String(error);
}
