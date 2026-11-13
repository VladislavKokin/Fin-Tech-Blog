import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useMatch, useParams } from 'react-router-dom';
import { Comments, PostContent, PostForm } from './components';
import { PrivateContent } from '../private-content/private-content'
import { Error } from '../error/error';
import { useServerRequest } from '../../hooks';
import { setPostData } from '../../store/action'
import { initialPostState } from '../../store/reducers/post-reducer'
import { selectPost } from '../../selectors'
import { ROLE } from '../../../shared/constants/index.js';
import styles from './post.module.css'

export const Post = () => {
    const storedPost = useSelector(selectPost);
    const dispatch = useDispatch();
    const params = useParams();
    const routeId = /^[a-f\d]{24}$/i.test(params.id || '') ? params.id.toLowerCase() : params.id
    const isCreating = !!useMatch('/post')
    const isEditing = !!useMatch('/post/:id/edit')
    const requestServer = useServerRequest()
    const post = isCreating ? initialPostState : storedPost
    const isCurrent = post.loaded && (post.id === routeId || (!post.id && post.requestedId === routeId))
    const error = isCurrent ? post.error : null

    useEffect(() => {
        if (isCreating || isCurrent) return
        let active = true
        requestServer('fetchPost', routeId).then(({ error, res }) => {
            if (!active) return
            dispatch(setPostData(error
                ? { ...initialPostState, requestedId: routeId, error }
                : { ...res, requestedId: routeId, error: null }
            ))
        })
        return () => { active = false }
    }, [dispatch, requestServer, routeId, isCreating, isCurrent]);

    if (!isCurrent && !isCreating) {
        return null
    }

    return error ? (
                <Error error={error}/>
            ) : isCreating || isEditing ? (
                <PrivateContent access={[ROLE.ADMIN]} serverError={error}>
                    <PostForm key={post.id} id={post.id} post={post} />
                </PrivateContent>
            ) : (
                <>
                    <div className={styles.container}>
                        <PostContent id={routeId} post={post}/>
                    </div>
                    <div className={styles.container}>
                        <Comments comments={post.comments} postId={post.id} />
                    </div>
                </>
            )
}
    
