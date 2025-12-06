import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { readDb, writeDb } from "../../database/database.js";

// IMPORTANT: this must match whatever your auth middleware uses for jwt.verify
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export default {
  async register({ username, password, profilePicture }) {
    // TODO: get ahold of the db using readDb();
    const db = await readDb();

    // TODO: check if there is an existing user with the same username
    const usernameTaken = db.users.find((user) => user.username === username);
    if (usernameTaken) {
      const error = new Error("Username already taken");
      error.statusCode = 400;
      throw error;
    }

    // TODO: otherwise, create a user object. A user has:
    //       - id: a random string-based id (crypto.randomUUID())
    //       - username: a username
    //       - password: a password
    //       - profilePicture: their profile pic string or an empty string if no picture.
    const user = {
      id: crypto.randomUUID(),
      username: username,
      password: password,
      profilePicture: profilePicture || "",
    };

    // TODO:  push this user object into db.users
    db.users.push(user);

    // TODO:  call the writeDb(db) operation to save changes.
    await writeDb(db);

    // TODO:  return the user object but without their password  (only id, username, profilePicture)
    return {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
    };
  },

  async login({ username, password }) {
    // TODO: get ahold of the db using readDb();
    const db = await readDb();

    // TODO: check the database for a user with a matching username and password
    const user = db.users.find(
      (u) => u.username === username && u.password === password
    );

    // TODO: if there is no user:
    //       - construct a new Error("Invalid username or password");
    //       - set the statusCode of that error object to 401
    //       - throw the err
    if (!user) {
      const error = new Error("Invalid username or password");
      error.statusCode = 401;
      throw error;
    }

    // TODO: otherwise, create a login token.
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // TODO:  return an object that contains 2 things:
    //  - token
    //  - user : { id: user.id, username: user.username, profilePicture: user.profilePicture }
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    };
  },
};
