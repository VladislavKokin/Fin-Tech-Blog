import { setPostData } from "./set-post-data.js"
import { ACTION_TYPE } from './action-type.js'

export const savePostAsync = (requestServer, newPostData) => (dispatch) => 
    requestServer('savePost', newPostData).then((updatedPost) => {
        if (!updatedPost.error) {
            dispatch(setPostData({ ...updatedPost.res, error: null }))
            dispatch({ type: ACTION_TYPE.INVALIDATE_POSTS })
        }
        return updatedPost
    })

