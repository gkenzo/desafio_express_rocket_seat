const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const todosEditableProps = ["title", "deadline"];

const checksIfTodoExists = (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todoX) => todoX.id === id);

  if (!todo)
    return res.status(404).send({
      error: "Não há nenhuma tarefa com o ID específicado.",
    });

  req.todo = todo;
  next();
};

const checksIfExistsUserAccount = (req, res, next) => {
  const { username } = req.headers;

  const user = users.find((searchedUser) => searchedUser.username === username);

  if (!user)
    return res
      .status(400)
      .send({ error: "Usuário inexistente. Crie um novo usuário." });

  req.user = user;
  next();
};

const users = [
  {
    id: "123",
    username: "teste",
    name: "teste",
    todos: [
      {
        id: "123",
        title: "first todo",
        deadline: Date.now(),
      },
    ],
  },
];

app.post("/users", (req, res) => {
  const { username = "", name = "" } = req.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) return res.status(400).send({ error: "Username taken." });

  const newUser = {
    id: uuidv4(),
    username: username,
    name: name,
    todos: [],
  };

  users.push(newUser);

  return res.status(201).send(newUser);
});

app.get("/todos", checksIfExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.status(200).send(user.todos);
});

app.get(
  "/todos/:id",
  checksIfExistsUserAccount,
  checksIfTodoExists,
  (req, res) => {
    const { todo } = req;

    return res.status(200).send(todo);
  }
);

app.post("/todos", checksIfExistsUserAccount, (req, res) => {
  const { title, deadline = new Date().toLocaleDateString("pt-br") } = req.body;
  const { user } = req;

  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date().toLocaleDateString("pt-br"),
  };

  user.todos.push(todo);

  return res.status(201).send(todo);
});

app.put(
  "/todos/:id",
  checksIfExistsUserAccount,
  checksIfTodoExists,
  (req, res) => {
    const { todo } = req;

    for (let param in req.body) {
      if (todosEditableProps.includes(param) && param !== "")
        todo[param] = req.body[param];
    }

    return res.status(200).send(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksIfExistsUserAccount,
  checksIfTodoExists,
  (req, res) => {
    const { todo } = req;

    todo.done = true;

    return res.status(200).send(todo);
  }
);

app.delete(
  "/todos/:id",
  checksIfExistsUserAccount,
  checksIfTodoExists,
  (req, res) => {
    const { todo, user } = req;

    user.todos = user.todos.filter((x) => x !== todo);

    return res.status(204).send(user.todos);
  }
);

module.exports = app;
