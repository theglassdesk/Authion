export type ViewType = 'document' | 'kanban' | 'grid';

export interface Page {
  id: string;
  title: string;
  icon?: string;
  type: ViewType;
  parentId: string | null;
  content: string; // Document text, or stringified JSON for kanban/grid
  createdAt: number;
  updatedAt: number;
}

// Kanban Types
export interface KanbanTask {
  id: string;
  content: string;
  assignee?: string;
  labels?: string[];
  status?: string;
  date?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanData {
  tasks: Record<string, KanbanTask>;
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
}

// Grid Types
export interface GridColumn {
  id: string;
  title: string;
  type: 'text' | 'number' | 'status' | 'date' | 'select' | 'multi-select' | 'checkbox';
  options?: string[]; // For select type
}

export interface GridRow {
  id: string;
  cells: Record<string, any>;
}

export interface GridData {
  columns: GridColumn[];
  rows: GridRow[];
}

export type AIProvider = 'Google' | 'OpenAI' | 'OpenRouter' | 'Local';

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey: string;
  localEndpoint: string;
}

