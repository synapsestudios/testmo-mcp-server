#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { getRuns } from "./tools/getRuns";
import { getRunResults } from "./tools/getRunResults";
import { searchCases } from "./tools/searchCases";
import { getMilestones } from "./tools/getMilestones";
import { createCases } from "./tools/createCases";
import { updateCases } from "./tools/updateCases";
import { createFolders } from "./tools/createFolders";
import { deleteCases } from "./tools/deleteCases";
import { deleteFolders } from "./tools/deleteFolders";
import { getCase } from "./tools/getCase";
import { findCase } from "./tools/findCase";
import { submitAutomationResult } from "./tools/submitAutomationResult";
import { getProjects } from "./tools/getProjects";
import { getProject } from "./tools/getProject";
import { getFolders } from "./tools/getFolders";
import { getRun } from "./tools/getRun";
import { getFields } from "./tools/getFields";
import { getCurrentUser } from "./tools/getCurrentUser";
import { getUsers } from "./tools/getUsers";
import { getProjectUsers } from "./tools/getProjectUsers";
import { getAutomationCases } from "./tools/getAutomationCases";
import { getAutomationRuns } from "./tools/getAutomationRuns";
import { getAutomationRun } from "./tools/getAutomationRun";
import { getAutomationSources } from "./tools/getAutomationSources";

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  // ── Projects ──────────────────────────────────────────────────────────────
  {
    name: "get_projects",
    description: "Returns a list of all Testmo projects the API token has access to. Useful for discovering project IDs.",
    inputSchema: {
      type: "object",
      properties: {
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
      },
    },
  },
  {
    name: "get_project",
    description: "Returns details for a single Testmo project by ID, including name, description, and settings.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
      },
      required: ["project_id"],
    },
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  {
    name: "get_current_user",
    description: "Returns the profile of the authenticated user (i.e. the owner of the API token in use).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_users",
    description: "Returns a paginated list of all users in the Testmo instance. Useful for resolving names to IDs for assignee filters.",
    inputSchema: {
      type: "object",
      properties: {
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
      },
    },
  },
  {
    name: "get_project_users",
    description: "Returns a paginated list of users who have access to a specific project.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
      },
      required: ["project_id"],
    },
  },

  // ── Read ──────────────────────────────────────────────────────────────────
  {
    name: "get_test_case",
    description:
      "Returns the details of a single test case by ID. The Testmo API has no direct single-case endpoint, so this paginates GET /projects/{project_id}/cases sorted by ID and returns the matching record.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        case_id: {
          type: "number",
          description: "The ID of the test case to retrieve",
        },
      },
      required: ["project_id", "case_id"],
    },
  },
  {
    name: "find_test_case",
    description:
      "Finds test cases by free-text query. Searches case names, descriptions, expected results, and any other text fields. Useful when you know a title, a URL that appears in the case, or a plain-English description (e.g. 'native staking first stake account'). Returns the top matches ranked by relevance. Fetches all project cases in parallel then scores client-side.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        query: {
          type: "string",
          description:
            "Free-text search query. Can be a partial title, a URL, or a plain-English description of the test case.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 5)",
        },
      },
      required: ["project_id", "query"],
    },
  },
  {
    name: "get_test_runs",
    description:
      "Returns a list of test runs for a given Testmo project. Each run has an ID, name, state, milestone, and result counts.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        per_page: {
          type: "number",
          description: "Results per page. Must be one of: 15, 25, 50, 100 (default: 50)",
          enum: [15, 25, 50, 100],
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        is_closed: {
          type: "boolean",
          description: "Filter: true = closed runs only, false = active runs only",
        },
        milestone_id: {
          type: "number",
          description: "Filter by milestone ID",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_run_results",
    description:
      "Returns test results for a given run. Each result has a status_id, case_id, assignee, and timestamps. Use status_id to filter: 1=Untested, 2=Passed, 3=Failed, 4=Retest, 5=Blocked, 6=Skipped.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: {
          type: "number",
          description: "The ID of the test run",
        },
        per_page: {
          type: "number",
          description: "Results per page. Must be one of: 15, 25, 50, 100 (default: 100)",
          enum: [15, 25, 50, 100],
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        status_id: {
          type: "string",
          description:
            "Comma-separated status IDs to filter by. 1=Untested, 2=Passed, 3=Failed, 4=Retest, 5=Blocked, 6=Skipped. Example: \"2,3\" for passed and failed.",
        },
        get_latest_result: {
          type: "boolean",
          description: "true = only the latest result per test, false (default) = all results",
        },
        assignee_id: {
          type: "string",
          description: "Comma-separated user IDs to filter by assignee",
        },
      },
      required: ["run_id"],
    },
  },
  {
    name: "search_test_cases",
    description:
      "Returns repository test cases for a project. Filter by folder, state, status, or template. Note: free-text name search is not supported by the API — use folder_id or other filters to narrow results.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        per_page: {
          type: "number",
          description: "Results per page. Must be one of: 15, 25, 50, 100 (default: 50)",
          enum: [15, 25, 50, 100],
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        folder_id: {
          type: "string",
          description: "Comma-separated folder IDs to filter by",
        },
        state_id: {
          type: "string",
          description: "Comma-separated state IDs to filter by",
        },
        status_id: {
          type: "string",
          description: "Comma-separated status IDs to filter by",
        },
        template_id: {
          type: "string",
          description: "Comma-separated template IDs to filter by",
        },
        has_automation: {
          type: "boolean",
          description: "Filter: true = cases with automation only, false = cases without",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_milestones",
    description:
      "Returns milestones for a given Testmo project, including name, due date, start date, and completion status.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        per_page: {
          type: "number",
          description: "Results per page. Must be one of: 15, 25, 50, 100 (default: 50)",
          enum: [15, 25, 50, 100],
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        is_completed: {
          type: "boolean",
          description: "Filter: true = completed milestones only, false = active only",
        },
        parent_id: {
          type: "string",
          description: "Comma-separated parent milestone IDs to filter by",
        },
        type_id: {
          type: "string",
          description: "Comma-separated milestone type IDs to filter by",
        },
      },
      required: ["project_id"],
    },
  },

  {
    name: "get_folders",
    description: "Returns a list of folders in a project's test repository. Use parent_id to list children of a specific folder, or omit it to list top-level folders.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
        parent_id: { type: "number", description: "Filter to children of this folder ID (omit for all folders)" },
        name: { type: "string", description: "Filter by folder name (partial match)" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_run",
    description: "Returns details for a single test run by ID, including name, state, milestone association, and result counts.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "number", description: "The ID of the test run" },
      },
      required: ["run_id"],
    },
  },
  {
    name: "get_fields",
    description: "Returns custom field definitions for a project. The entity filter can scope results to a specific Testmo entity type (e.g. 'repository_case', 'run_result').",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
        entity: { type: "string", description: "Filter by entity type, e.g. 'repository_case' or 'run_result'" },
      },
      required: ["project_id"],
    },
  },

  // ── Automation ────────────────────────────────────────────────────────────
  {
    name: "get_automation_runs",
    description: "Returns a paginated list of automation runs for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_automation_run",
    description: "Returns details for a single automation run by ID.",
    inputSchema: {
      type: "object",
      properties: {
        automation_run_id: { type: "number", description: "The ID of the automation run" },
      },
      required: ["automation_run_id"],
    },
  },
  {
    name: "get_automation_cases",
    description: "Returns automation cases (tracked automated tests) for a project. Filter by source, status, name, or folder path.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
        source_id: { type: "number", description: "Filter by automation source ID" },
        status: { type: "string", description: "Filter by status alias, e.g. 'passed', 'failed', 'untested'" },
        name: { type: "string", description: "Filter by test name (partial match)" },
        folder: { type: "string", description: "Filter by folder path (partial match)" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_automation_sources",
    description: "Returns automation sources for a project. Sources group automated tests by suite name (e.g. 'backend', 'frontend').",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        per_page: { type: "number", description: "Results per page: 15, 25, 50, or 100 (default: 50)", enum: [15, 25, 50, 100] },
        page: { type: "number", description: "Page number (default: 1)" },
        is_retired: { type: "boolean", description: "true = retired sources only, false = active only" },
      },
      required: ["project_id"],
    },
  },

  // ── Write ─────────────────────────────────────────────────────────────────
  {
    name: "create_test_cases",
    description:
      "Creates one or more repository test cases in a project (max 100 per call). Returns the created cases with their assigned IDs.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The Testmo project ID",
        },
        cases: {
          type: "array",
          description: "Array of test cases to create (max 100)",
          maxItems: 100,
          items: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", description: "Name of the test case" },
              folder_id: { type: "number", description: "Folder to place the case in (omit for root)" },
              template_id: { type: "number", description: "Template ID to use for the case" },
              state_id: { type: "number", description: "Workflow state ID" },
              estimate: { type: "number", description: "Estimated duration in seconds" },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Tag names to apply (created if they don't exist)",
              },
            },
          },
        },
      },
      required: ["project_id", "cases"],
    },
  },
  {
    name: "update_test_cases",
    description:
      "Updates one or more existing repository test cases (max 100 per call). All specified cases receive the same field values — only include fields you want to change.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        ids: {
          type: "array",
          description: "IDs of the cases to update (max 100)",
          maxItems: 100,
          items: { type: "number" },
        },
        name: { type: "string", description: "New name to set on all matched cases" },
        folder_id: { type: "number", description: "Move all matched cases to this folder ID (use null for root)" },
        state_id: { type: "number", description: "Workflow state ID to set" },
        status_id: { type: "number", description: "Status ID to set" },
        estimate: { type: "number", description: "Estimated duration in seconds" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Replaces all existing tags on matched cases",
        },
      },
      required: ["project_id", "ids"],
    },
  },
  {
    name: "delete_test_cases",
    description:
      "Permanently deletes one or more repository test cases from a project. This action is irreversible.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        ids: {
          type: "array",
          description: "IDs of the test cases to delete",
          items: { type: "number" },
        },
      },
      required: ["project_id", "ids"],
    },
  },
  {
    name: "create_folders",
    description:
      "Creates one or more folders in a project's test repository (max 100 per call). Folders can be nested by supplying a parent_id.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        folders: {
          type: "array",
          description: "Array of folders to create (max 100)",
          maxItems: 100,
          items: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", description: "Name of the folder" },
              parent_id: { type: "number", description: "Parent folder ID for nesting (omit for top-level)" },
              docs: { type: "string", description: "Optional description or notes for the folder" },
            },
          },
        },
      },
      required: ["project_id", "folders"],
    },
  },
  {
    name: "delete_folders",
    description:
      "Permanently deletes one or more folders from a project's test repository. Also deletes all test cases contained within those folders. This action is irreversible.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        ids: {
          type: "array",
          description: "IDs of the folders to delete",
          items: { type: "number" },
        },
      },
      required: ["project_id", "ids"],
    },
  },
  {
    name: "submit_automation_result",
    description:
      "Submits automation test results to Testmo in a single call. Internally creates a run, opens a thread, appends all test results, then completes the thread and run — so Claude doesn't need to orchestrate three separate API calls.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "The Testmo project ID" },
        run_name: { type: "string", description: "Display name for the automation run (e.g. 'CI build #42')" },
        source: {
          type: "string",
          description:
            "Short source name identifying the test suite (e.g. 'backend', 'frontend', 'mobile-ios'). Created automatically if it doesn't exist.",
        },
        tests: {
          type: "array",
          description: "Array of test results to submit",
          items: {
            type: "object",
            required: ["key", "name", "status", "folder"],
            properties: {
              key: {
                type: "string",
                description:
                  "Stable identifier for this test across runs (max 64 lowercase alphanumeric chars). Used to track pass/fail history.",
              },
              name: { type: "string", description: "Human-readable test name" },
              status: {
                type: "string",
                description: "Result status alias, e.g. 'passed', 'failed', 'skipped'. Must match a status configured in Testmo.",
              },
              folder: {
                type: "string",
                description: "Fully qualified folder path for grouping (e.g. 'Auth/Login' or 'api.users.create')",
              },
              duration: { type: "number", description: "Test duration in milliseconds (optional)" },
              message: { type: "string", description: "Failure message or stack trace (optional)" },
            },
          },
        },
        milestone_id: { type: "number", description: "Associate the run with a milestone (optional)" },
      },
      required: ["project_id", "run_name", "source", "tests"],
    },
  },
];

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "testmo-mcp", version: "3.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "get_projects":
        result = await getProjects({
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
        });
        break;

      case "get_project":
        result = await getProject({ project_id: args["project_id"] as number });
        break;

      case "get_current_user":
        result = await getCurrentUser();
        break;

      case "get_users":
        result = await getUsers({
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
        });
        break;

      case "get_project_users":
        result = await getProjectUsers({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
        });
        break;

      case "get_test_case":
        result = await getCase({
          project_id: args["project_id"] as number,
          case_id: args["case_id"] as number,
        });
        break;

      case "find_test_case":
        result = await findCase({
          project_id: args["project_id"] as number,
          query: args["query"] as string,
          limit: args["limit"] as number | undefined,
        });
        break;

      case "get_test_runs":
        result = await getRuns({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          is_closed: args["is_closed"] as boolean | undefined,
          milestone_id: args["milestone_id"] as number | undefined,
        });
        break;

      case "get_run_results":
        result = await getRunResults({
          run_id: args["run_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          status_id: args["status_id"] as string | undefined,
          get_latest_result: args["get_latest_result"] as boolean | undefined,
          assignee_id: args["assignee_id"] as string | undefined,
        });
        break;

      case "search_test_cases":
        result = await searchCases({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          folder_id: args["folder_id"] as string | undefined,
          state_id: args["state_id"] as string | undefined,
          status_id: args["status_id"] as string | undefined,
          template_id: args["template_id"] as string | undefined,
          has_automation: args["has_automation"] as boolean | undefined,
        });
        break;

      case "get_folders":
        result = await getFolders({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          parent_id: args["parent_id"] as number | undefined,
          name: args["name"] as string | undefined,
        });
        break;

      case "get_run":
        result = await getRun({ run_id: args["run_id"] as number });
        break;

      case "get_fields":
        result = await getFields({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          entity: args["entity"] as string | undefined,
        });
        break;

      case "get_automation_runs":
        result = await getAutomationRuns({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
        });
        break;

      case "get_automation_run":
        result = await getAutomationRun({ automation_run_id: args["automation_run_id"] as number });
        break;

      case "get_automation_cases":
        result = await getAutomationCases({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          source_id: args["source_id"] as number | undefined,
          status: args["status"] as string | undefined,
          name: args["name"] as string | undefined,
          folder: args["folder"] as string | undefined,
        });
        break;

      case "get_automation_sources":
        result = await getAutomationSources({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          is_retired: args["is_retired"] as boolean | undefined,
        });
        break;

      case "get_milestones":
        result = await getMilestones({
          project_id: args["project_id"] as number,
          per_page: args["per_page"] as 15 | 25 | 50 | 100 | undefined,
          page: args["page"] as number | undefined,
          is_completed: args["is_completed"] as boolean | undefined,
          parent_id: args["parent_id"] as string | undefined,
          type_id: args["type_id"] as string | undefined,
        });
        break;

      case "create_test_cases":
        result = await createCases({
          project_id: args["project_id"] as number,
          cases: args["cases"] as Array<{
            name: string;
            folder_id?: number;
            template_id?: number;
            state_id?: number;
            estimate?: number;
            tags?: string[];
          }>,
        });
        break;

      case "update_test_cases":
        result = await updateCases({
          project_id: args["project_id"] as number,
          ids: args["ids"] as number[],
          name: args["name"] as string | undefined,
          folder_id: args["folder_id"] as number | undefined,
          state_id: args["state_id"] as number | undefined,
          status_id: args["status_id"] as number | undefined,
          estimate: args["estimate"] as number | undefined,
          tags: args["tags"] as string[] | undefined,
        });
        break;

      case "delete_test_cases":
        result = await deleteCases({
          project_id: args["project_id"] as number,
          ids: args["ids"] as number[],
        });
        break;

      case "create_folders":
        result = await createFolders({
          project_id: args["project_id"] as number,
          folders: args["folders"] as Array<{
            name: string;
            parent_id?: number;
            docs?: string;
          }>,
        });
        break;

      case "delete_folders":
        result = await deleteFolders({
          project_id: args["project_id"] as number,
          ids: args["ids"] as number[],
        });
        break;

      case "submit_automation_result":
        result = await submitAutomationResult({
          project_id: args["project_id"] as number,
          run_name: args["run_name"] as string,
          source: args["source"] as string,
          tests: args["tests"] as Array<{
            key: string;
            name: string;
            status: string;
            folder: string;
            duration?: number;
            message?: string;
          }>,
          milestone_id: args["milestone_id"] as number | undefined,
        });
        break;

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Testmo MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
