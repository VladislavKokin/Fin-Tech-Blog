import { setPostData } from "./set-post-data.js"

export const loadPost = (requestServer, postId) => (dispatch) =>
    requestServer('fetchPost', postId).then((postData) => {
        if (postData.res){
            dispatch(setPostData({ ...postData.res, error: null }))
        }

        return postData;
    })
