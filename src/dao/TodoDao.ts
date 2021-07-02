import { QueryError } from "mysql2";
import { Todo, TodoPartial } from "../todo/Todo";

interface queryCallback<ReturnType> {
    (err: QueryError, res?: undefined): void;
    (err: null, res: ReturnType): void;
}

interface TodoDao {
    getAllTodo(cb: queryCallback<Todo[]>): void;
    getTodoById(id: number, cb: queryCallback<Todo | null>): void;
    getTodoByKeyword(kw: string, cb: queryCallback<Todo[]>): void;
    addTodo(todo: TodoPartial, cb: queryCallback<number>): void;
    updateTodo(id: number, todo: TodoPartial, cb: queryCallback<number>): void;
    deleteTodo(id: number, cb: queryCallback<number>): void;
}

export { TodoDao, queryCallback };