import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import { userReducer, usersReducer, postReducer, postsReducer } from "./reducers/index.js";


const reducer = combineReducers({
    user: userReducer,
    users: usersReducer,
    post: postReducer,
    posts: postsReducer,
    runtime: (state = { dateLabel: '' }) => state,
});


export const makeStore = (preloadedState) => {
    const composeEnhancers = typeof window !== 'undefined'
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        : compose;
    return createStore(reducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));
};
