export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};

export type TaskActivity = {
  id: number;
  task_id: number;
  user_name: string;
  type: 'comment' | 'activity';
  content: string;
  created_at: string;
};

export type Task = {
  id: number;
  board_id: number;
  column_id: number;
  assignee_id?: number | null;
  assignee?: User | null;
  task_key: string; // e.g. GUC-101
  title: string;
  description: string | null;
  priority: Priority;
  order: number;
  due_date: string | null;
  labels: string[] | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  activities?: TaskActivity[];
  created_at: string;
  updated_at: string;
};

export type Column = {
  id: number;
  board_id: number;
  title: string;
  order: number;
  color: string | null;
  tasks: Task[];
};

export type BoardSummary = {
  id: number;
  title: string;
  prefix: string;
  slug: string;
  color: string;
};

export type Workspace = {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  color: string;
  description: string | null;
  invite_code: string;
  boards?: BoardSummary[];
};

export type Board = {
  id: number;
  workspace_id?: number | null;
  title: string;
  slug: string;
  prefix: string;
  task_counter: number;
  color: string;
  description: string | null;
  columns: Column[];
};
