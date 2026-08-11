import { authorize, fetchRoles, fetchUsers, logout, register } from './operations';

export const server = {
    authorize,
    fetchUsers,
    fetchRoles,
    logout,
    register,
}