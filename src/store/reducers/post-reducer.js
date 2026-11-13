import { ACTION_TYPE } from "../action/action-type.js";

export const initialPostState = {
    id:'',
    title: '',
    imageUrl: '',
    content: { introduction: '', body: '', conclusion: '' },
    publishedAt: '',
    comments: [],
    loaded: false,
    error: null,
};

export const postReducer = (state = initialPostState, action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_POST_DATA:
            return {
                ...state,
                ...action.payload,
                requestedId: action.payload.requestedId || action.payload.id || state.requestedId,
                loaded: true,
            };
        case ACTION_TYPE.SET_USER:
            return state.error && !state.id ? initialPostState : state;
        case ACTION_TYPE.RESET_POST_DATA:
            return initialPostState;
        default:
            return state;
    }
}
