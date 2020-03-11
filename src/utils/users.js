users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: 'username or room not provided'
    };
  }
  const existingUser = users.find(
    user => user.username === username && user.room === room
  );
  if (existingUser) {
    return {
      error: `${username} already in the room.`
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
  return undefined;
};
const getUser = id => {
  return users.find(user => user.id === id);
};
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
