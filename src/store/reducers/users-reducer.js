import { ACTION_TYPE } from '../action/action-type.js';

export const initialUsersState = {
    users: [], roles: [], loaded: false, error: null,
};

export const usersReducer = (state = initialUsersState, action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_USERS_DATA:
            return { ...state, ...action.payload, loaded: true };
        case ACTION_TYPE.LOGOUT:
            return initialUsersState;
        default:
            return state;
    }
}
