import { setPostData } from "./set-post-data.js"
import { ACTION_TYPE } from './action-type.js'

export const addComment = (requestServer, userId, postId, content) => (dispatch) =>
    requestServer('addPostComment', userId, postId, content).then((postData) => {
        if (!postData.error) {
            dispatch(setPostData({ ...postData.res, error: null }))
            dispatch({ type: ACTION_TYPE.INVALIDATE_POSTS })
        }
        return postData
    })
