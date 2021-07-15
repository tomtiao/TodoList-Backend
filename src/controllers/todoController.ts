import express from 'express';
import path from 'path';
import TodoDaoImpl from '../dao/impl/TodoDaoImpl';
import { TodoDao } from '../dao/TodoDao';
import { todo_id_options, todo_options } from '../todo/Todo';
import { createTodoPartial } from '../util/createTodoPartial';

// TODO: Add meaningful message in the response
const router = express.Router();
router.route('/')
    .options((_, res) => {
        res.header('Allow', todo_options)
            .sendStatus(204);
    })
    .all((_, res, next) => {
        res.locals.todoDao = new TodoDaoImpl(res.locals.pool);
        next();
    })
    .get((req, res, next) => {
            if (Object.keys(req.query).length > 0) {
                next();
            } else {
                (res.locals.todoDao as TodoDao).getAllTodo((err, result) => {
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
                    (res.locals.todoDao as TodoDao).getTodoByKeyword(req.query.kw, (err, result) => {
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
            let newTodo;
            try {
                newTodo = createTodoPartial(req.body);
            } catch (e) {
                res.sendStatus(400);
                return;
            }
            (res.locals.todoDao as TodoDao).addTodo(newTodo, (err, id) => {
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
    .all((_, res, next) => {
        (res.locals.todoDao as TodoDao) = new TodoDaoImpl(res.locals.pool);
        next();
    })
    .get((req, res) => {
        (res.locals.todoDao as TodoDao).getTodoById( +(req.params.id) , (err, result) => {
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
        let partialTodo;
        try {
            partialTodo = createTodoPartial(req.body);
        } catch (e) {
            res.sendStatus(400);
            return;
        }
        (res.locals.todoDao as TodoDao).updateTodo(id, partialTodo, (err, affectedRows) => {
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
        (res.locals.todoDao as TodoDao).deleteTodo(id, (err, affectedRows) => {
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