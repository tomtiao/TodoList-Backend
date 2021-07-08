type Timestamp = number;

interface Todo {
    Id: number;
    Content: string;
    Note: string | null;
    CreationTime: Timestamp;
    ReminderTime: Timestamp | null;
    Priority: Priority;
    Flagged: boolean;
    Completed: boolean;
}

interface TodoQuery {
    kw: string;
}

const enum Priority {
    None,
    Low,
    Medium,
    High
}

const TodoInstance: TodoPartial = {
    Content: '',
    Note: null,
    ReminderTime: null,
    Priority: 0,
    Flagged: false,
    Completed: false
} as const;

type TodoPartial = { [P in keyof Todo as Exclude<P, 'Id'> & Exclude<P, 'CreationTime'>]?: Todo[P] }

const todo_options = 'OPTIONS, GET, POST';

const todo_id_options = 'OPTIONS, GET, PUT, DELETE';

const todo_path = '/todo';

export type { Timestamp, Todo, TodoQuery, TodoPartial };

export { todo_options, todo_id_options, todo_path, Priority, TodoInstance };