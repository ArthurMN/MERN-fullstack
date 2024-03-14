const User = require("../models/User");
const Note = require("../models/Note");

// @desc Get all notes
// @route GET /notes
// @access Private

const getAllNotes = async (request, response) => {
  //Get all notes from mongoDB
  const notes = await Note.find().lean();

  //If no notes
  if (!notes?.length) {
    return response.status(400).json({ message: "No notes found" });
  }

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  response.json(notesWithUser);
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (request, response) => {
  const { user, title, text } = request.body;

  //Confirm data
  if (!user || !title || !text) {
    return response.status(400).json({ message: "All fields are required" });
  }

  //Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "pt", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return response.status(409).json({ message: "Duplicate note title" });
  }

  //Create and store new note
  const note = await Note.create({ user, title, text });

  if (note) {
    response.status(201).json({ message: "New note created" });
  } else {
    response.status(400).json({ message: "Invalid note data received" });
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = async (request, response) => {
  const { id, user, title, text, completed } = request.body;

  //Confirm data
  if (!id || !title || !text || !user || typeof completed !== "boolean") {
    return response.status(400).json({ message: "All fields are required" });
  }

  //Confirm if notes exists
  const note = await Note.findById(id).exec();

  if (!note) {
    return response.status(400).json({ message: "Note not found" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "pt", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return response.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  response.json({ message: `${updatedNote.title} updated` });
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (request, response) => {
  const { id } = request.body;

  //confirm data
  if (!id) {
    return response.status(400).json({ message: "Note ID required" });
  }

  //confirm note exists
  const note = await Note.findById(id).exec();

  if (!note) {
    return response.status(400).json({ message: "Note not found" });
  }

  //delete note
  const result = note;
  await note.deleteOne();
  const reply = `Note ${result.title} with ID ${result._id} deleted`;
  response.json(reply);
};

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
