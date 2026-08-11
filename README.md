# Testmo MCP Server

A Model Context Protocol (MCP) server for the [Testmo](https://testmo.com) test management platform. Uses the official [`@testmo/testmo-api`](https://www.npmjs.com/package/@testmo/testmo-api) SDK so it tracks Testmo API changes automatically.

## Prerequisites

- Node.js 18+
- npm or yarn
- A Testmo API token (Settings → API Tokens)

## Token permissions

| Tools | Required Testmo permission |
|---|---|
| `get_projects`, `get_project`, `get_current_user`, `get_users` | Instance-level access (any valid token) |
| All other `get_*` / `search_*` / `find_*` read tools | **View** access to the project |
| `create_test_cases`, `update_test_cases`, `delete_test_cases`, `create_folders`, `delete_folders` | **Edit repository** access to the project |
| `get_automation_*`, `submit_automation_result` | **Automation** access to the project |

Write tools return `403` if the token's role lacks the required access. Assign the API user an Admin role or a custom role with the relevant permissions enabled in Testmo's role settings.

## Setup

### Option A: Run via npx (recommended)

No install or build step required — `npx` fetches and runs the published package on demand. Skip to [Registering with Claude Desktop](#registering-with-claude-desktop) below.

### Option B: Clone and build locally

```bash
cd testmo-mcp-server
npm install
npm run build
```

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `TESTMO_API_TOKEN` | **Required.** Bearer token from Testmo | — |
| `TESTMO_BASE_URL` | **Required.** Base URL of your Testmo instance (e.g. `https://your-instance.testmo.net`) | — |

You can test the build manually:
```bash
TESTMO_API_TOKEN=your_token_here TESTMO_BASE_URL=https://your-instance.testmo.net node dist/index.js
```

---

## Registering with Claude Desktop

Add the following block to your `claude_desktop_config.json` (typically at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

**Via npx (no local install needed):**

```json
{
  "mcpServers": {
    "testmo": {
      "command": "npx",
      "args": ["-y", "@synapsestudios/testmo-mcp-server@latest"],
      "env": {
        "TESTMO_API_TOKEN": "your_testmo_api_token_here",
        "TESTMO_BASE_URL": "https://your-instance.testmo.net"
      }
    }
  }
}
```

**Via a local clone/build:**

```json
{
  "mcpServers": {
    "testmo": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/testmo-mcp-server/dist/index.js"],
      "env": {
        "TESTMO_API_TOKEN": "your_testmo_api_token_here",
        "TESTMO_BASE_URL": "https://your-instance.testmo.net"
      }
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/testmo-mcp-server` with the actual path where you cloned/placed this project.

**Restart Claude Desktop** after saving the config for the server to be picked up.

---

## Available Tools

### Projects

#### `get_projects`
Returns all Testmo projects the API token has access to. Useful for discovering project IDs.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |

#### `get_project`
Returns details for a single project by ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | The Testmo project ID |

---

### Users

#### `get_current_user`
Returns the profile of the authenticated user (owner of the API token). No parameters.

#### `get_users`
Returns a paginated list of all users in the Testmo instance. Useful for resolving names to IDs for assignee filters.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |

#### `get_project_users`
Returns users who have access to a specific project.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | The Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |

---

### Read

#### `find_test_case`
Finds test cases by free-text query. Fetches all pages in parallel and scores results client-side across names, descriptions, and any other text fields. Returns top matches ranked by relevance (exact name → substring → word matches). This is the MCP's unique strength — neither Testmo's own API nor competing MCPs support free-text case search.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `query` | string | Yes | Free-text query: partial title, URL, or plain-English description |
| `limit` | number | No | Max results to return (default: 5) |

#### `get_test_case`
Returns a single test case by ID. Paginates the cases list sorted by ID and stops as soon as the target is found.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `case_id` | number | Yes | ID of the test case to retrieve |

#### `search_test_cases`
Returns a page of repository test cases with optional filters. Free-text name search is not supported by the Testmo API — use `find_test_case` for that.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `folder_id` | string | No | Comma-separated folder IDs to filter by |
| `state_id` | string | No | Comma-separated state IDs to filter by |
| `status_id` | string | No | Comma-separated status IDs to filter by |
| `template_id` | string | No | Comma-separated template IDs to filter by |
| `has_automation` | boolean | No | `true` = cases with automation only |

#### `get_test_runs`
Returns a paginated list of test runs for a project.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `is_closed` | boolean | No | `true` = closed runs only, `false` = active only |
| `milestone_id` | number | No | Filter by milestone ID |

#### `get_run_results`
Returns test result entries for a specific run.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | number | Yes | ID of the test run |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 100) |
| `page` | number | No | Page number (default: 1) |
| `status_id` | string | No | Comma-separated status IDs. 1=Untested, 2=Passed, 3=Failed, 4=Retest, 5=Blocked, 6=Skipped |
| `get_latest_result` | boolean | No | `true` = only the latest result per test |
| `assignee_id` | string | No | Comma-separated user IDs to filter by assignee |

#### `get_folders`
Returns folders in a project's test repository.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `parent_id` | number | No | List children of this folder only (omit for all folders) |
| `name` | string | No | Filter by folder name (partial match) |

#### `get_run`
Returns details for a single test run by ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | number | Yes | ID of the test run |

#### `get_fields`
Returns custom field definitions for a project. Useful for understanding what custom data is attached to cases or results.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `entity` | string | No | Filter by entity type, e.g. `repository_case` or `run_result` |

#### `get_milestones`
Returns milestones for a project.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `is_completed` | boolean | No | `true` = completed milestones only, `false` = active only |
| `parent_id` | string | No | Comma-separated parent milestone IDs to filter by |
| `type_id` | string | No | Comma-separated milestone type IDs to filter by |

---

### Automation

#### `get_automation_runs`
Returns a paginated list of automation runs for a project.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |

#### `get_automation_run`
Returns details for a single automation run by ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `automation_run_id` | number | Yes | ID of the automation run |

#### `get_automation_cases`
Returns automation cases (tracked automated tests) for a project. Filter by source, status, name, or folder path.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `source_id` | number | No | Filter by automation source ID |
| `status` | string | No | Filter by status alias, e.g. `passed`, `failed`, `untested` |
| `name` | string | No | Filter by test name (partial match) |
| `folder` | string | No | Filter by folder path (partial match) |

#### `get_automation_sources`
Returns automation sources for a project. Sources group automated tests by suite name (e.g. `backend`, `frontend`).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `per_page` | number | No | Results per page: 15, 25, 50, or 100 (default: 50) |
| `page` | number | No | Page number (default: 1) |
| `is_retired` | boolean | No | `true` = retired sources only, `false` = active only |

---

### Write

#### `create_test_cases`
Creates one or more repository test cases (max 100 per call). Returns the created cases with their assigned IDs.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `cases` | array | Yes | Array of case objects (max 100) |
| `cases[].name` | string | Yes | Name of the test case |
| `cases[].folder_id` | number | No | Folder to place the case in (omit for root) |
| `cases[].template_id` | number | No | Template ID |
| `cases[].state_id` | number | No | Workflow state ID |
| `cases[].estimate` | number | No | Estimated duration in seconds |
| `cases[].tags` | string[] | No | Tag names (created if they don't exist) |

#### `update_test_cases`
Updates one or more existing test cases (max 100 per call). All matched cases receive the same field values — only include fields you want to change.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `ids` | number[] | Yes | IDs of the cases to update (max 100) |
| `name` | string | No | New name for all matched cases |
| `folder_id` | number | No | Move all matched cases to this folder (null = root) |
| `state_id` | number | No | Workflow state ID to set |
| `status_id` | number | No | Status ID to set |
| `estimate` | number | No | Estimated duration in seconds |
| `tags` | string[] | No | Replaces all existing tags on matched cases |

#### `delete_test_cases`
Permanently deletes one or more test cases. **Irreversible.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `ids` | number[] | Yes | IDs of the test cases to delete |

#### `create_folders`
Creates one or more folders in a project's test repository (max 100 per call).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `folders` | array | Yes | Array of folder objects (max 100) |
| `folders[].name` | string | Yes | Name of the folder |
| `folders[].parent_id` | number | No | Parent folder ID for nesting (omit for top-level) |
| `folders[].docs` | string | No | Optional description or notes |

#### `delete_folders`
Permanently deletes one or more folders and all test cases inside them. **Irreversible.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `ids` | number[] | Yes | IDs of the folders to delete |

#### `submit_automation_result`
Submits automation test results in a single call. Internally orchestrates the full Testmo lifecycle (create run → create thread → append tests → complete thread → complete run) so Claude doesn't need to make multiple tool calls.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | number | Yes | Testmo project ID |
| `run_name` | string | Yes | Display name for the automation run (e.g. `CI build #42`) |
| `source` | string | Yes | Short source identifier (e.g. `backend`, `frontend`, `mobile-ios`). Auto-created if it doesn't exist. |
| `tests` | array | Yes | Array of test result objects |
| `tests[].key` | string | Yes | Stable identifier used to track history across runs (max 64 lowercase alphanumeric chars) |
| `tests[].name` | string | Yes | Human-readable test name |
| `tests[].status` | string | Yes | Status alias, e.g. `passed`, `failed`, `skipped` (must match a status configured in Testmo) |
| `tests[].folder` | string | Yes | Fully qualified folder path for grouping (e.g. `Auth/Login`) |
| `tests[].duration` | number | No | Test duration in milliseconds |
| `tests[].message` | string | No | Failure message or stack trace |
| `milestone_id` | number | No | Associate the run with a milestone |

---

## Development

```bash
# Run directly with ts-node (no build needed)
TESTMO_API_TOKEN=xxx npm run dev
```
