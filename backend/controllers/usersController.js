const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (request, response) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return response.status(400).json({ message: "No users found" });
  }
  response.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (request, response) => {
  const { username, password, roles } = request.body;

  //Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return response.status(400).json({ message: "All fields are required" });
  }

  //Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return response.status(409).json({ message: "Duplicate username" });
  }

  //Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = { username, password: hashedPwd, roles };

  //Create and store new user
  const user = await User.create(userObject);

  if (user) {
    response.status(201).json({ message: `New user ${username} created` });
  } else {
    response.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (request, response) => {
  const { id, username, roles, active, password } = request.body;

  //Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return response.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return response.status(400).json({ message: "User not found" });
  }

  //Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  //Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return response.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }

  const updatedUser = await user.save();

  response.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.body;

  if (!id) {
    return response.status(400).json({ message: "User ID required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return response.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return response.status(400).json({ message: "User not found" });
  }

  const result = user
  await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} deleted`;
  response.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
