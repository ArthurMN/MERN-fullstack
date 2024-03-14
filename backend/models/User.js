const mongoose = require("mongoose");

/*
Roles: O array em roles define que o usuário pode receber mais de uma role, 
sendo Employee a básica de todos os usuários. Então ele pode ser um Employee e um Manager.

Active: Define se o usuário está ativo ou não, permitindo a remoção de acesso do mesmo assim que necessário.
*/

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ["Employee"],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);
