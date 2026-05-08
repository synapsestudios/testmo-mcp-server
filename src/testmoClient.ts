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
