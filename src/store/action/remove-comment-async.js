import { setPostData } from "./set-post-data.js"
import { ACTION_TYPE } from './action-type.js'

export const removeComment = (requestServer, postId, id) => (dispatch) =>
    requestServer('removePostComment', postId, id).then((postData) => {
        if (!postData.error) {
            dispatch(setPostData({ ...postData.res, error: null }))
            dispatch({ type: ACTION_TYPE.INVALIDATE_POSTS })
        }
        return postData
    })
