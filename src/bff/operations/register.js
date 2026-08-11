import { addUser } from "../api/add-user";
import { getUser } from "../api/get-user";
import { sessions } from "../sessions";

export const register = async (regLogin, regPassword) => {

        const user = await getUser(regLogin) 

        if (user) {
            return {
                error: 'Логин уже занят, попробуйте другой',
                res: null,
            };
        }

        await addUser(regLogin, regPassword)

        return {
            error: null,
            res: {    
                id: user.id,
                login: user.login,
                roleId: user.role_id,
                session: sessions.create(user),
            }
        }
    }
