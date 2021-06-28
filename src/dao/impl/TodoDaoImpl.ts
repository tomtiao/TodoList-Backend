import { OkPacket, Pool, RowDataPacket } from "mysql2";
import { Todo, TodoPartial } from "../../todo/Todo";
import { ActualFieldPacket, castBoolToTiny, castResultsToTodo } from "../../util/cast";
import { TodoDao, queryCallback } from "../TodoDao";

class TodoDaoImpl implements TodoDao {
    private pool: Pool;

    public constructor(pool: Pool) {
        this.pool = pool;
    }

    public getAllTodo(cb: queryCallback<Todo[]>): void {
        this.pool.execute('select * from Todo;', function (err, rows, fields) {
            if (err) {
                cb(err);
            } else {
                const results = castResultsToTodo(rows as RowDataPacket[], fields as unknown as ActualFieldPacket[]);
                cb(null, results);
            }
        });
    }

    public getTodoById(id: number, cb: queryCallback<Todo | null>): void {
        const sql = 'select * from Todo where Id = ?;';
        this.pool.execute(sql, [id], function (err, rows, fields) {
            if (err) {
                cb(err);
            } else {
                const todos = castResultsToTodo(rows as RowDataPacket[], fields as unknown as ActualFieldPacket[]);
                const result = todos[0];
                cb(null, result ? result : null);
            }
        });
    }
    
    public getTodoByKeyword(kw: string, cb: queryCallback<Todo[]>): void {
        const sql = `select * from Todo
                    where Content like ${this.pool.escape(`%${kw}%`)};`;
        this.pool.execute(sql, function (err, rows, fields) {
            if (err) {
                cb(err);
            } else {
                const results = castResultsToTodo(rows as RowDataPacket[], fields as unknown as ActualFieldPacket[]);
                cb(null, results);
            }
        });
    }

    public addTodo(todo: TodoPartial, cb: queryCallback<number>): void {
        const convertedTodo = castBoolToTiny(todo);
        this.pool.execute(`insert into todo set ${this.pool.escape(convertedTodo)}`, function (err, results) {
            if (err) {
                cb(err);
            } else {
                cb(null, (results as OkPacket).insertId);
            }
        });
    }

    public updateTodo(id: number, todo: TodoPartial, cb: queryCallback<number>): void {
        const convertedTodo = castBoolToTiny(todo);
        this.pool.execute(`update todo set ${this.pool.escape(convertedTodo)}
                        where Id = ${this.pool.escape(id)};`, function (err, results) {
            if (err) {
                cb(err);
            } else {
                cb(null, (results as OkPacket).affectedRows);
            }
        });
    }

    public deleteTodo(id: number, cb: queryCallback<number>): void {
        this.pool.execute('delete from todo where id = ?;', [id], function (err, results) {
            if (err) {
                cb(err);
            } else {
                cb(null, (results as OkPacket).affectedRows);
            }
        });
    }
}

export default TodoDaoImpl;