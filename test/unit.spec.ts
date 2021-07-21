import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import path from 'path';
import { todo_id_options, todo_options, todo_path, Todo, TodoPartial } from '../src/todo/Todo';
import app from '../src/index'
import { randomUUID } from 'crypto';
chai.use(chaiHttp)
const getType = Function.prototype.call.bind( Object.prototype.toString )

describe(todo_path, function () {
    describe(`OPTIONS ${todo_path}`, function () {
        it(`ALLOW header should be ${todo_options}`, function (done) {
            chai.request(app)
                .options(todo_path)
                .then(function (res) {
                    expect(res).to.have.status(204)
                    expect(res).to.have.header('ALLOW', todo_options)
                    done()
                })
                .catch(done)
        })
    })

    describe(`GET ${todo_path}`, function () {
        it('should return a array.', function (done) {
            chai.request(app)
                .get(todo_path)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json;
                    expect(Array.isArray(res.body)).to.be.true;
                    done()
                })
                .catch(done)
        })
    })
    const kw = '测试';
    describe(`GET ${todo_path}?kw=${kw}`, function () {
        it(`should return a list of todo whose title contains ${kw}.`, function (done) {
            const query_path = `${todo_path}?kw=${encodeURIComponent(kw)}`;
            chai.request(app)
                .get(query_path)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json
                    expect(Array.isArray(res.body)).to.be.true
                    expect((res.body as Todo[]).length).gt(0)
                    expect((res.body as Todo[]).every(todo => todo.Content.includes(kw))).to.be.true
                    done()
                })
                .catch(done)
        })
        it(`should return an empty list when kw is empty string.`, function (done) {
            const query_path = `${todo_path}?kw=`;
            chai.request(app)
                .get(query_path)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json
                    expect(Array.isArray(res.body)).to.be.true
                    expect((res.body as Todo[]).length).eq(0)
                    done()
                })
                .catch(done)
        })
        it(`should return 400 Bad Request when kw is not a string`, function (done) {
            const query_path = `${todo_path}?kw[]=`;
            chai.request(app)
                .get(query_path)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    done()
                })
                .catch(done)
        })
    })
    describe(`GET ${todo_path}?type={type}`, function () {
        it('should return a list of todo whose type is {type}.')
    })
    describe(`POST ${todo_path}`, function () {
        const Content = `测试内容${randomUUID()}`;
        let todo_location: string;
        it(`should return Location: /todo/:id of todo that just created.`, function (done) {
            const req: TodoPartial = {
                Content,
                Flagged: true,
                Completed: true
            };
            chai.request(app)
                .post(todo_path)
                .send(req)
                .then(function (res) {
                    expect(res).to.have.status(201)
                    expect(res).to.have.header('Location', new RegExp(`${todo_path}/\\d+$`))
                    todo_location = res.get('Location')
                    done()
                })
                .catch(done)
        })
        let id: number;
        it(`should be able to get /todo/:id and the content should be the same.`, function (done) {
            chai.request(app)
                .get(todo_location)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(getType(res.body)).eq('[object Object]')
                    expect(res.body.Content).eq(Content)
                    id = res.body.Id;
                    done()
                })
                .catch(done)
        })
        it(`should be able to get /todo/:id and the time should be a timestamp.`, function (done) {
            chai.request(app)
                .get(todo_location)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(getType(res.body)).eq('[object Object]')
                    expect(typeof (res.body as Todo).CreationTime).eq('number')
                    done()
                })
                .catch(done)
        })
        after(`Delete created todo.`, function (done) {
            chai.request(app)
                .delete(`${todo_path}/${id}`)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json;
                    expect(res.body).eq(id)
                    done()
                })
                .catch(done)
        })
    })
})

const id = Math.trunc(Math.random() * 100000);
const todo_id_path = `${path.join(todo_path, id + "")}`
describe(`${todo_path}/id`, function () {
    describe('GET Query invalid id', function () {
        it(`should handle non-numeric id and return 400`, function (done) {
            chai.request(app)
                .get(`${todo_path}/abc`)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    done()
                })
                .catch(done)
        })
        it(`should handle Infinity and return 400`, function (done) {
            chai.request(app)
                .get(`${todo_path}/${Math.pow(10, 1000)}`)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    done()
                })
                .catch(done)
        })
        it(`should handle negative number and return 400`, function (done) {
            chai.request(app)
                .get(`${todo_path}/-1`)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    done()
                })
                .catch(done)
        })
        it(`should handle 0 and return 400`, function (done) {
            chai.request(app)
                .get(`${todo_path}/0`)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    done()
                })
                .catch(done)
        })
    })
    describe('OPTIONS', function () {
        it(`ALLOW header should contain ${todo_id_options}`, function (done) {
            chai.request(app)
                .options(todo_path)
                .then(function (res) {
                    expect(res).to.have.status(204)
                    expect(res).to.have.header('ALLOW', todo_options)
                    done()
                })
                .catch(done)
        })
    })
    const first_todo_id = 1;
    describe(`GET ${todo_path}/${first_todo_id}`, function () {
        it(`should return first todo info`, function (done) {
            chai.request(app)
                .get(`${todo_path}/${first_todo_id}`)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(getType(res.body)).eq('[object Object]')
                    done()
                })
                .catch(done)
        })
        it(`property 'Flagged' and 'Completed' should be boolean.`, function (done) {
            chai.request(app)
                .get(`${todo_path}/${first_todo_id}`)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(getType(res.body))
                        .eq('[object Object]')
                    expect(typeof (res.body as Todo).Flagged).eq('boolean')
                    expect(typeof(res.body as Todo).Completed).eq('boolean')
                    done()
                })
                .catch(done)
        })
    })
    describe(`GET ${todo_path}/${Number.MAX_SAFE_INTEGER}`, function () {
        it(`should return 404 if todo doesn't exist.`, function (done) {
            chai.request(app)
                .get(`${todo_path}/${Number.MAX_SAFE_INTEGER}`)
                .then(function (res) {
                    expect(res).to.have.status(404)
                    done()
                })
                .catch(done)
        })
    })
    describe('PUT', function () {
        it(`should return 404 if todo doesn't exist.`, function (done) {
            const o: TodoPartial = {
                Completed: true,
                Flagged: true
            };
            chai.request(app)
                .put(`${todo_path}/${Number.MAX_SAFE_INTEGER}`)
                .send(o)
                .then(function (res) {
                    expect(res).to.have.status(404)
                    done()
                })
                .catch(done)
        })
        let id = -1;
        before(`Create temp todo.`, function (done) {
            const req: TodoPartial = {
                Content: 'temp'
            };
            chai.request(app)
                .post(`${todo_path}`)
                .send(req)
                .then(function (res) {
                    expect(res).to.have.status(201)
                    expect(res).to.have.header('Location', new RegExp(`${todo_path}/\\d+$`))
                    const arr = res.get('Location').split('/')
                    id = +(arr[arr.length - 1])
                    done()
                })
                .catch(done)
        })
        it(`should return 204 No Content. Content-Location header should be ${todo_path}/${id}.`, function (done) {
            const o: TodoPartial = {
                Completed: true,
                Flagged: true
            };
            chai.request(app)
                .put(`${todo_path}/${id}`)
                .send(o)
                .then(function (res) {
                    expect(res).to.have.status(204)
                    expect(res).to.have.header('Content-Location', `${todo_path}/${id}`)
                    done()
                })
                .catch(done)
        })
        it(`should update the todo.`, function (done) {
            chai.request(app)
                .get(`${todo_path}/${id}`)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json
                    expect((res.body as Todo).Completed).to.be.true
                    expect((res.body as Todo).Flagged).to.be.true
                    done()
                })
                .catch(done)
        })
        after(`Delete temp todo.`, function (done) {
            chai.request(app)
                .delete(`${todo_path}/${id}`)
                .then(function (res) {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json; 
                    expect(res.body).eq(id)
                    done()
                })
                .catch(done)
        })
    })

    describe('DELETE', function () {
        it(`should return 404 if the todo doesn't exist.`, function (done) {
            chai.request(app)
                .delete(`${todo_id_path}/2333333333`)
                .then(function (res) {
                    expect(res).to.have.status(404)
                    done()
                })
                .catch(done)
        })
        it(`should return the id after deletion.`, function () {
            let id = -1;
            before(`Create temp todo.`, function (done) {
                chai.request(app)
                    .post(`${todo_path}`)
                    .then(function (res) {
                        expect(res).to.have.status(201)
                        expect(res).to.have.header('Location', new RegExp(`${todo_path}/\\d+$`))
                        const arr = res.get('Location').split('/')
                        id = +(arr[arr.length - 1])
                        done()
                    })
                    .catch(done)
            })
            it(`delete temp todo.`, function (done) {
                chai.request(app)
                    .delete(`${todo_path}/${id}`)
                    .then(function (res) {
                        expect(res).to.have.status(200)
                        expect(res).to.be.json;
                        expect(res.body).eq(id)
                        done()
                    })
                    .catch(done)
            })
        })
    })
})