import { RowDataPacket } from "mysql2";
import { Todo, TodoPartial } from "../todo/Todo";

type ActualFieldPacket = { // mysql2 typing of FieldPacket is wrong, using this for now.
    encoding: string;
    name: string;
    columnLength: number;
    columnType: number;
    flags: number;
    decimals: number;
}

function castResultsToTodo(rows: RowDataPacket[], fields: ActualFieldPacket[]): Todo[] {
    return rows.map(row => {
        const typeCastedRow = row as Todo;
        fields.forEach(field => {
            const name = field.name;
            const v = row[name];
            if (field.columnType === 0x01) { // TINY is 0x01, from mysql2/lib/constants/types.js
                typeCastedRow[name] = (v === 1);
            } else if ((field.columnType === 0x0c) && (v !== null)) {
                // DATETIME is 0x0c. ReminderTime may be null.
                typeCastedRow[name] = (v as Date).getTime();
            }
        });
        return typeCastedRow;
    });
}

type ConvertedFrom<T> = { [P in keyof T as Exclude<P, 'Flagged' | 'Completed' | 'ReminderTime'>]: T[P] }
& {
    Flagged: '1' | '0';
    Completed: '1' | '0';
    ReminderTime?: Date | null;
}

type ConvertedTodo = ConvertedFrom<Todo>
type ConvertedTodoPartial = ConvertedFrom<TodoPartial>

function castTodoToDbItem(todo: Todo | TodoPartial): ConvertedTodo | ConvertedTodoPartial {
    const converter: { Flagged: '1' | '0'; Completed: '1' | '0'; ReminderTime: Date | null } = {
        Flagged: todo.Flagged ? '1' : '0',
        Completed: todo.Completed ? '1' : '0',
        ReminderTime: null
    };

    if (todo?.ReminderTime) {
        converter.ReminderTime = new Date(todo.ReminderTime)
    }

    return { ...todo, ...converter };
}

export {
    ActualFieldPacket,
    castResultsToTodo,
    castTodoToDbItem as castBoolToTiny
}