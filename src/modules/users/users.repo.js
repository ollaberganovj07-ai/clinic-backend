let users = [];
let idCounter = 1;

async function list() {
  return users;
}

async function getById(id) {
  return users.find(u => u.id === id) || null;
}

async function create(data) {
  const newUser = { id: idCounter++, ...data };
  users.push(newUser);
  return newUser;
}

async function update(id, data) {
  const index = users.findIndex(u => u.id === id);

  if (index === -1) return null;

  users[index] = { ...users[index], ...data };
  return users[index];
}

async function remove(id) {
  const index = users.findIndex(u => u.id === id);

  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}

module.exports = { list, getById, create, update, remove };