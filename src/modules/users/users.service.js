const usersRepo = require('./users.repo');

async function list() {
  return usersRepo.list();
}

async function getById(id) {
  const user = await usersRepo.getById(id);
  return user;
}

async function create(payload) {
  return usersRepo.create(payload);
}

async function update(id, payload) {
  const updatedUser = await usersRepo.update(id, payload);
  return updatedUser;
}

async function remove(id) {
  const deleted = await usersRepo.remove(id);
  return deleted;
}

module.exports = { list, getById, create, update, remove };