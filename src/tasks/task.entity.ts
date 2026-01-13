export interface Task {
  gid: string;
  name: string;
  completed: boolean;
  projectGid: string;
  createdAt: string;

  // extra fields to support core scenarios
  notes?: string;
  assigneeGid?: string | null;
  workspaceGid: string;
  sectionGid?: string | null;
  tagGids?: string[];
  followerGids?: string[];
  parentGid?: string | null;
  dueOn?: string | null;
  completedAt?: string | null;
}
  