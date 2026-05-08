import { repositoryCasesApi } from "../testmoClient";

interface CaseRecord {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface FindCaseParams {
  project_id: number;
  query: string;
  limit?: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function stringValue(val: unknown): string {
  if (typeof val === "string") return stripHtml(val).toLowerCase();
  return "";
}

/**
 * Score a single case against a query.
 *
 * Scoring tiers (not exposed to callers, used only for ranking):
 *   100 – name is an exact case-insensitive match
 *    80 – name contains the full query as a substring
 *    10 per word – each query word found in the name
 *     4 per word – each query word found in any other text field
 */
function score(c: CaseRecord, queryWords: string[], rawQuery: string): number {
  const name = (c.name ?? "").toLowerCase();

  if (name === rawQuery) return 100;
  if (name.includes(rawQuery)) return 80;

  const descBlob = Object.keys(c)
    .filter((k) => k !== "name" && k !== "id")
    .map((k) => stringValue(c[k]))
    .join(" ");

  let s = 0;
  for (const word of queryWords) {
    if (name.includes(word)) s += 10;
    else if (descBlob.includes(word)) s += 4;
  }
  return s;
}

async function fetchPage(project_id: number, page: number): Promise<{ result: CaseRecord[]; last_page: number | null; next_page: number | null }> {
  return repositoryCasesApi.getCasesPage(project_id, { perPage: 100, page });
}

export async function findCase(params: FindCaseParams): Promise<unknown> {
  const { project_id, query, limit = 5 } = params;

  const rawQuery = query.toLowerCase().trim();
  const queryWords = rawQuery.split(/\s+/).filter(Boolean);

  const firstPage = await fetchPage(project_id, 1);
  const lastPage = firstPage.last_page ?? 1;

  const remainingPages =
    lastPage > 1
      ? await Promise.all(
          Array.from({ length: lastPage - 1 }, (_, i) => fetchPage(project_id, i + 2))
        )
      : [];

  const allCases: CaseRecord[] = [
    ...firstPage.result,
    ...remainingPages.flatMap((p) => p.result),
  ];

  const scored = allCases
    .map((c) => ({ case: c, score: score(c, queryWords, rawQuery) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.case);

  return {
    total_searched: allCases.length,
    matches_found: scored.length,
    results: scored,
  };
}
