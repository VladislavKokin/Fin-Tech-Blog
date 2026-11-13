import { listRoles, listUsers, removeUser, updateUserRole } from '../services/users.js'

export async function getUsers(req, res) {
  res.json({ error: null, data: await listUsers() })
}

export function getRoles(req, res) {
  res.json({ error: null, data: listRoles() })
}

export async function patchUserRole(req, res) {
  res.json({ error: null, data: await updateUserRole(req.params.id, req.body?.roleId) })
}

export async function deleteUser(req, res) {
  res.json({ error: null, data: await removeUser(req.params.id) })
}
