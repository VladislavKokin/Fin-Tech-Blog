import { ACTION_TYPE } from '../action/action-type.js';
import { ROLE } from '../../../shared/constants/index.js';

export const initialUserState = {
    id: null,
    login: null,
    roleId: ROLE.GUEST,
};

export const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_USER:
            return {
                ...state, 
                ...action.payload,
            };
        case ACTION_TYPE.LOGOUT: 
            return initialUserState;
        default:
            return state;
    }
}
