# TodoList-Backend

## 目录

- [API](#API)

## API

### 查询

#### 查询所有 todo

``` GET /todo ```

返回含所有 todo 的数组

#### 查询标题含 kw 的 todo

``` GET /todo?kw={kw} ```

返回

1. 如果 kw 不为空，返回标题含 kw 的 todo
2. 如果 kw 为空字符串，返回空数组
3. 如果 kw 为其他，返回 400 Bad Request

#### 查询特定类型的 todo

``` GET /todo?type={?} ```

#### 查询完成或未完成的 todo

``` GET /todo?completed={true|false} ```

返回含所有 {completed} 的 todo 的数组

#### 查询特定时间范围的 todo

粒度：天

``` GET /todo?start_time={?}&end_time={?} ```

#### 查询特定 todo

``` GET /todo/{id} ```

返回

1. 如果 id > 0 && id <= Number.MAX_VALUE

    - 如果 id 对应 todo 存在

    ```typescript
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
    ```

    - 否则返回 404

2. 否则 400 Bad Request

### 增加

#### 新增一个 todo

``` POST /todo ```

Payload:

```typescript
const TodoInstance: TodoPartial = {
    Content: '',
    Note: null,
    ReminderTime: null,
    Priority: 0,
    Flagged: false,
    Completed: false
} as const;

type TodoPartial = { [P in keyof Todo as Exclude<P, 'Id'> & Exclude<P, 'CreationTime'>]?: Todo[P] }
```

1. 如果 TodoPartial 合适

    - 返回 201 Created 和 Location: /todo/:id

2. 否则返回 400 Bad Request

### 修改 todo

``` PUT /todo/{id} ```

Payload:

```typescript
const TodoInstance: TodoPartial = {
    Content: '',
    Note: null,
    ReminderTime: null,
    Priority: 0,
    Flagged: false,
    Completed: false
} as const;

type TodoPartial = { [P in keyof Todo as Exclude<P, 'Id'> & Exclude<P, 'CreationTime'>]?: Todo[P] }
```

返回

1. 如果 id 对应 todo 存在

    - 204 No Content，头部 Content-Location: /todo/{id}

2. 如果收到的 todo 不合适，返回 400

3. 否则返回 404

### 删除

``` DELETE /todo/{id} ```

1. 如果 id > 0 && id <= Number.MAX_VALUE

    - 如果 id 对应 todo 存在

        - 返回 200 OK 以及删除条目的 id

    - 否则返回 404

2. 否则返回 400 Bad Request
