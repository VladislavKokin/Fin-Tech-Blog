import { ACTION_TYPE } from '../action/action-type.js';

export const initialPostsState = {
    posts: [], page: 1, lastPage: 1, searchPhrase: '', loaded: false, error: null,
};

export const postsReducer = (state = initialPostsState, action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_POSTS_DATA:
            return { ...state, ...action.payload, loaded: true };
        case ACTION_TYPE.INVALIDATE_POSTS:
            return { ...state, loaded: false };
        default:
            return state;
    }
}
