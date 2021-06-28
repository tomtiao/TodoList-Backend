import express from 'express';
import path from 'path';
import TodoDaoImpl from '../dao/impl/TodoDaoImpl';
import { TodoDao } from '../dao/TodoDao';
import { todo_id_options, todo_options } from '../todo/Todo';
import { createTodoPartial } from '../util/createTodoPartial';

const router = express.Router();
let todoDao: TodoDao;

router.route('/')
    .options((_, res) => {
        res.header('Allow', todo_options)
            .sendStatus(204);
    })
    .all((_req, res, next) => {
        todoDao = new TodoDaoImpl(res.locals.pool);
        next();
    })
    .get((req, res, next) => {
            if (Object.keys(req.query).length > 0) {
                next();
            } else {
                todoDao.getAllTodo((err, result) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                    } else {
                        res.json(result);
                    }
                });
            }
        }, (req, res) => {
            if (typeof req.query.kw === 'string') {
                if (req.query.kw.length === 0) {
                    res.json([]);
                } else {
                    todoDao.getTodoByKeyword(req.query.kw, (err, result) => {
                        if (err) {
                            console.error(err);
                            res.sendStatus(500);
                        } else {
                            res.json(result);
                        }
                    });
                }
            } else {
                res.sendStatus(400);
            }
        })
    .post((req, res) => {
        if (typeof req.body.Content === 'string') {
            const newTodo = createTodoPartial(req.body);
            todoDao.addTodo(newTodo, (err, id) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    res.set('Location', `${path.join(req.baseUrl, id!.toString())}`)
                    .sendStatus(201);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });


router.route('/:id')
    .all((req, res, next) => {
        const id = (+req.params.id);
        if (Number.isFinite(id) && id > 0) {
            next();
        } else {
            res.sendStatus(400);
        }
    })
    .options((_, res) => {
        res.header('Allow', todo_id_options)
            .sendStatus(204);
    })
    .get((_req, res, next) => {
        todoDao = new TodoDaoImpl(res.locals.pool);
        next();
    },
    (req, res) => {
        todoDao.getTodoById( +(req.params.id) , (err, result) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                if (result === null) {
                    res.sendStatus(404);
                } else {
                    res.json(result);
                }
            }
        });
    })
    .put((req, res) => {
        const id = +(req.params.id);
        const partialTodo = createTodoPartial(req.body);
        todoDao.updateTodo(id, partialTodo, (err, affectedRows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (affectedRows! > 0) {
                    res.set('Content-Location', `${req.baseUrl}/${id}`)
                        .sendStatus(204);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    })
    .delete((req, res) => {
        const id = +(req.params.id);
        todoDao.deleteTodo(id, (err, affectedRows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (affectedRows! > 0) {
                    res.json(id);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    });

export default router;