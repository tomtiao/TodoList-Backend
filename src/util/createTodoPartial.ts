import { TodoInstance, TodoPartial } from "../todo/Todo";

const CONTENT_MAXLEN = 255;
const NOTE_MAXLEN = 1000;

const expectedTypes: { [P in keyof TodoPartial]: string | string[] } = {
    Content: '[object String]',
    Note: ['[object String]', '[object Null]'],
    ReminderTime: ['[object Number]', '[object Null]'],
    Priority: '[object Number]',
    Flagged: '[object Boolean]',
    Completed: '[object Boolean]'
}

const getType = Object.prototype.toString;

const isValidVal = (obj: Record<string, unknown>, k: keyof TodoPartial) => {
    if (Array.isArray(expectedTypes[k])) {
        return (expectedTypes[k] as string[]).indexOf(getType.call(obj[k])) !== -1;
    }
    return expectedTypes[k] === getType.call(obj[k]);
};

class ContentTooLong extends Error {
    public constructor(message = 'Content is too long.') {
        super(message);
        this.name = this.constructor.name;
    }
}

class NoteTooLong extends Error {
    public constructor(message = 'Note is too long.') {
        super(message);
        this.name = this.constructor.name;
    }
}

class InvalidValue extends Error {
    public constructor(message = 'Value is invalid.') {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Selectively construct a new TodoPartial using the given object.
 * @param o key value object
 * @returns a TodoPartial, which is a Todo without property Id
 * @throws {ContentTooLong} if content's length is greater than CONTENT_MAXLEN
 * @throws {NoteTooLong} if note's length is greater than NOTE_MAXLEN
 * @throws {InvalidValue} if value's type is not those in Todo
 */
export function createTodoPartial(o: Record<string, unknown>): TodoPartial {
    if (typeof o.Content === 'string' && o.Content.length > CONTENT_MAXLEN) {
        throw new ContentTooLong()
    }
    if (typeof o.Note === 'string' && o.Note.length > NOTE_MAXLEN) {
        throw new NoteTooLong()
    }

    const availableKeys = Object.keys(o).filter(key => key in TodoInstance) as (keyof TodoPartial)[];
    
    const newTodo: TodoPartial = {};
    availableKeys.forEach((k: keyof TodoPartial) => {
        if (isValidVal(o, k)) {
            type K = keyof TodoPartial;
            (newTodo[k] as TodoPartial[K]) = o[k] as TodoPartial[K];
        } else {
            throw new InvalidValue()
        }
    });
    return newTodo;
}