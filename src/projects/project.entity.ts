export interface Project {
  gid: string;
  name: string;
  workspaceGid: string;
  createdAt: string;

  // minimal Asana-like extras
  notes?: string;
  archived?: boolean;
  ownerGid?: string;
  color?: string;
  dueOn?: string | null;
}
  