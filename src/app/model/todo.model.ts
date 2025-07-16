export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
}

export interface TodosState {
  items : Todo[];
  loading : boolean;
  error : string | null;
}