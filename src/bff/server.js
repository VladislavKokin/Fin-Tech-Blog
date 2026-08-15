import { authorize, fetchRoles, fetchUsers, logout, register, updateUserRole, removeUser } from './operations';

export const server = {
    authorize,
    fetchUsers,
    fetchRoles,
    logout,
    register,
    updateUserRole,
    removeUser
}