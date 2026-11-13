import { ACTION_TYPE } from './action-type.js'

export const removePostAsync = (requestServer, id) => (dispatch) =>
    requestServer('removePost', id).then((result) => {
        if (!result.error) {
            dispatch({ type: ACTION_TYPE.INVALIDATE_POSTS })
            dispatch({ type: ACTION_TYPE.RESET_POST_DATA })
        }
        return result
    })
