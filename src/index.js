const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFound = users.find((user) => user.username === username);

  if (!userFound) {
    return response.status(404).json({ error: "User not found" });
  }

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already Exists" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const index = users.findIndex((user) => user.username === username);

  users[index].todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }
  const todo = users[userIndex].todos[todoIndex];
  todo.title = title;
  todo.deadline = new Date(deadline);
  users[userIndex].todos[todoIndex] = todo;
  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  const todo = users[userIndex].todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;
  users[userIndex].todos[todoIndex] = todo;
  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).json(users[userIndex].todos);
});

module.exports = app;
