export type SearchResultType = 'project' | 'device' | 'member' | 'task';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  subtitle?: string;
  href: string;
}
