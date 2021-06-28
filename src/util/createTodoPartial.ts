import { TodoInstance, TodoPartial } from "../todo/Todo";

export function createTodoPartial(o: Record<string, unknown>): TodoPartial {
    const availableKeys = Object.keys(o).filter(key => key in TodoInstance);
    const newTodo: TodoPartial = {};
    for (const key of availableKeys) {
        newTodo[key] = o[key];
    }

    return newTodo;
}