import { request } from './base-api.js';
import { PAGINATION_LIMIT } from '../constants/index.js';

const postPath = (id) => `/posts/${encodeURIComponent(id)}`;

export const server = {
    register: (login, password) => request('/auth/register', { method: 'POST', body: { login, password } }),
    authorize: (login, password) => request('/auth/login', { method: 'POST', body: { login, password } }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    currentUser: () => request('/auth/me'),
    fetchPosts: (search = '', page = 1, limit = PAGINATION_LIMIT) => request(`/posts?${new URLSearchParams({ search, page, limit })}`),
    fetchPost: (id) => request(postPath(id)),
    savePost: ({ id, ...body }) => request(id ? postPath(id) : '/posts', { method: id ? 'PUT' : 'POST', body }),
    removePost: (id) => request(postPath(id), { method: 'DELETE' }),
    addPostComment: (_userId, postId, content) => request(`${postPath(postId)}/comments`, { method: 'POST', body: { content } }),
    removePostComment: (postId, id) => request(`${postPath(postId)}/comments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    fetchUsers: () => request('/users'),
    fetchRoles: () => request('/roles'),
    updateUserRole: (id, roleId) => request(`/users/${encodeURIComponent(id)}/role`, { method: 'PATCH', body: { roleId } }),
    removeUser: (id) => request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
