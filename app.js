const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format, isValid } = require("date-fns");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Start...");
    });
  } catch (err) {
    console.log(`DB Err: ${err.message()}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//middleware function checking status, priority, category, date

const checkStatus = (request, response, next) => {
  const { status } = request.query;
  if (
    status == "TO DO" ||
    status == "IN PROGRESS" ||
    status == "DONE" ||
    status == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const checkPriority = (request, response, next) => {
  const { priority } = request.query;
  if (
    priority == "HIGH" ||
    priority == "MEDIUM" ||
    priority == "LOW" ||
    priority == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const checkCategory = (request, response, next) => {
  const { category } = request.query;
  if (
    category == "WORK" ||
    category == "HOME" ||
    category == "LEARNING" ||
    category == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const checkDateGet = (request, response, next) => {
  const { date } = request.query;
  const valiDate = isValid(new Date(date));
  if (valiDate) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};
//middleware function post method

const checkStatusPost = (request, response, next) => {
  const { status } = request.body;
  if (
    status == "TO DO" ||
    status == "IN PROGRESS" ||
    status == "DONE" ||
    status == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const checkPriorityPost = (request, response, next) => {
  const { priority } = request.body;
  if (
    priority == "HIGH" ||
    priority == "MEDIUM" ||
    priority == "LOW" ||
    priority == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const checkCategoryPost = (request, response, next) => {
  const { category } = request.body;
  if (
    category == "WORK" ||
    category == "HOME" ||
    category == "LEARNING" ||
    category == undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const checkDate = (request, response, next) => {
  const { dueDate } = request.body;
  const valiDate = isValid(new Date(dueDate));
  if (valiDate) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

//******************************************************** */

//property check
const categoryAndStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};
const categoryAndPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};
const priorityAndStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const categoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const statusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const priorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
//.......property check

const create = (item) => {
  return {
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    status: item.status,
    category: item.category,
    dueDate: item.due_date,
  };
};

//API 1: return the list of todo
app.get(
  "/todos/",
  checkStatus,
  checkPriority,
  checkCategory,
  async (request, response) => {
    const { search_q = "", category, status, priority } = request.query;
    let getTodoQuery;
    switch (true) {
      case categoryAndStatus(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            category = '${category}' and
            status = '${status}';
          `;
        break;
      case categoryAndPriority(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            category = '${category}' and
            priority = '${priority}';
          `;
        break;
      case priorityAndStatus(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            priority = '${priority}' and
            status = '${status}';
          `;
        break;
      case categoryProperty(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            category = '${category}';
          `;
        break;
      case statusProperty(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            status = '${status}';
          `;
        break;
      case priorityProperty(request.query):
        getTodoQuery = `
          select * from todo
          where 
            todo like '%${search_q}%' and
            priority = '${priority}';
          `;
        break;
      default:
        getTodoQuery = `
          select 
            * 
          from 
            todo 
          where 
            todo like '%${search_q}%';
          `;
        break;
    }
    const getTodo = await db.all(getTodoQuery);
    response.send(getTodo.map((eachItem) => create(eachItem)));
  }
);

//API 2: return specific todo
app.get(
  "/todos/:todoId/",
  checkStatus,
  checkPriority,
  checkCategory,
  async (request, response) => {
    const { todoId } = request.params;
    const getTodoQuery = `
    select
      *
    from 
      todo
    where 
      id = ${todoId};
    `;
    const getTodo = await db.get(getTodoQuery);
    response.send(create(getTodo));
  }
);

//API 3: return todo specific due_date
app.get("/agenda/", checkDateGet, async (request, response) => {
  const { date } = request.query;
  const formattingDate = format(new Date(date), "yyyy-MM-dd");
  const getTodoQuery = `
    select 
        * 
    from 
        todo
    where 
        due_date = '${formattingDate}';
    `;
  const getDueTodo = await db.all(getTodoQuery);
  response.send(getDueTodo.map((eachItem) => create(eachItem)));
});

//API 4: create todo
app.post(
  "/todos/",
  checkStatusPost,
  checkPriorityPost,
  checkCategoryPost,
  checkDate,
  async (request, response) => {
    const { id, todo, priority, status, category, dueDate } = request.body;
    const dateFormat = format(new Date(dueDate), "yyyy-MM-dd");
    const createTodoQuery = `
  insert into
    todo (id, todo, priority, status, category, due_date)
  values (
      ${id},
      '${todo}',
      '${priority}',
      '${status}',
      '${category}',
      '${dateFormat}'
  );
  `;
    const createTodo = await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  }
);

//date check
const checkDatePut = (request, response, next) => {
  const { dueDate } = request.body;
  if (dueDate == undefined) {
    next();
  } else {
    const valiDate = isValid(new Date(dueDate));
    if (valiDate) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

//API 5: update todo
app.put(
  "/todos/:todoId/",
  checkStatusPost,
  checkPriorityPost,
  checkCategoryPost,
  checkDatePut,
  async (request, response) => {
    const { todoId } = request.params;
    const { todo, priority, status, category, dueDate } = request.body;

    if (todo !== undefined) {
      const updateTodoQuery = `
        update 
            todo
        set 
            todo = '${todo}'
        where
            id = ${todoId};
        `;
      const updateTodo = await db.run(updateTodoQuery);
      response.send("Todo Updated");
    }
    if (priority !== undefined) {
      const updateTodoQuery = `
        update 
            todo
        set 
            priority = '${priority}'
        where
            id = ${todoId};
        `;
      const updateTodo = await db.run(updateTodoQuery);
      response.send("Priority Updated");
    }
    if (status !== undefined) {
      const updateTodoQuery = `
        update 
            todo
        set 
            status = '${status}'
        where
            id = ${todoId};
        `;
      const updateTodo = await db.run(updateTodoQuery);
      response.send("Status Updated");
    }
    if (category !== undefined) {
      const updateTodoQuery = `
        update 
            todo
        set 
            category = '${category}'
        where
            id = ${todoId};
        `;
      const updateTodo = await db.run(updateTodoQuery);
      response.send("Category Updated");
    }
    if (dueDate !== undefined) {
      const newDate = format(new Date(dueDate), "yyyy-MM-dd");
      const updateTodoQuery = `
        update 
            todo
        set 
            due_date = '${newDate}'
        where
            id = ${todoId};
        `;
      const updateTodo = await db.run(updateTodoQuery);
      response.send("Due Date Updated");
    }
  }
);

//API 6: delete todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    delete from 
        todo 
    where 
        id = '${todoId}';
    `;
  const deleteTodo = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
