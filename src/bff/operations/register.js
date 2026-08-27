import { addUser } from "../api/add-user";
import { getUser } from "../api/get-user";
import { transformUser } from "../transformers";
import { sessions } from "../sessions";

export const register = async (regLogin, regPassword) => {

        const existedUser = await getUser(regLogin)

        if (existedUser) {
            return {
                error: 'Логин уже занят, попробуйте другой',
                res: null,
            };
        }

        const user = transformUser(await addUser(regLogin, regPassword))

        return {
            error: null,
            res: {
                id: user.id,
                login: user.login,
                roleId: user.roleId,
                session: sessions.create(user),
            }
        }
    }
