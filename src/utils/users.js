const users = [];

// add user
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // check for existing user
  const existUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existUser) {
    return {
      error: "A user with the same username exist in the room!",
    };
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// delete user
const removeUser = (id) => {
  const userIndex = users.findIndex((user) => {
    return user.id === id;
  });
  if (userIndex < 0) {
    return { error: "no user found with this id!" };
  }
  return users.splice(userIndex, 1)[0];
};

// get user
const getUser = (id) => {
  return users.find((user) => {
    return user.id === id;
  });
};

// get all users in room
const getUsersInRoom = (room) => {
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
