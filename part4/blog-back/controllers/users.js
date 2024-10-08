const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(users);
});

usersRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(user);
})

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!(username && password)) {
    return response.status(400).json({
      error: "missing input fields",
    });
  }

  if (!(username.length > 3 && password.length > 3)) {
    return response.status(400).json({
      error: "username and password must be at least 4 characters long",
    });
  }

  const userInDB = await User.findOne({ username });

  if (userInDB) {
    return response.status(400).json({
      error: "username already exists",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
