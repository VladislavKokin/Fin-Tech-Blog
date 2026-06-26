import { getUser } from './get-user'
import { addUser } from './add-user';
import { createSession } from './create-session'

export const server = {
    async authorize(authLogin, authPassword) {

        const user = await getUser(authLogin)        

        if (!user) {
            return {
                error: 'Пользователь не найден',
                res: null,
            };
        }

        if (authPassword !== user.password) {
            return {
                error: 'Неверный пароль',
                res: null,
            }
        }

        const session = {
                logout() {
                    Object.keys(session).forEach((key) => {
                        delete session[key];
                    });
                },
                removeComment() {
                    console.log('Удаление комментария')
                }
            }

        return {
            error: null,
            res: createSession(user.role_id),
        };
    },

    async register(regLogin, regPassword) {

        const user = await getUser(regLogin) 

        if (user) {
            return {
                error: 'Логин уже занят, попробуйте другой',
                res: null,
            };
        }

        await addUser(regLogin, regPassword)

        const session = {
                logout() {
                    Object.keys(session).forEach((key) => {
                        delete session[key];
                    });
                },
                removeComment() {
                    console.log('Удаление комментария')
                }
            }

        return {
                error: null,
                res: createSession(user.role_id),
        }
    }
};