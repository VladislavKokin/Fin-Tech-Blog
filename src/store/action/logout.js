import { ACTION_TYPE } from './action-type.js'
import { server } from '../../../shared/api/index.js'

export const logout = () => async (dispatch) => {
    const result = await server.logout();
    if (!result.error) dispatch({ type: ACTION_TYPE.LOGOUT });
    return result;
};
