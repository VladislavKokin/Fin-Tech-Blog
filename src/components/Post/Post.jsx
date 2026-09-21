import { useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useMatch, useParams } from 'react-router-dom';
import { Comments, PostContent, PostForm } from './components';
import { PrivateContent } from '../private-content/private-content'
import { Error } from '../error/error';
import { useServerRequest } from '../../hooks';
import { RESET_POST_DATA, loadPost } from '../../store/action'
import { selectPost } from '../../selectors'
import { ROLE } from '../../bff/constants';
import styles from './Post.module.css'

export const Post = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const post = useSelector(selectPost);
    const dispatch = useDispatch();
    const params = useParams();
    const isCreating = !!useMatch('/post')
    const isEditing = !!useMatch('/post/:id/edit')
    const requestServer = useServerRequest()

    useLayoutEffect(() => {
        dispatch(RESET_POST_DATA)
    }, [dispatch, isCreating])

    useEffect(() => {
        if (isCreating) {
            return;
        }
        dispatch(loadPost(requestServer, params.id)).then((postData) => {
            setError(postData.error)
            setIsLoading(false)
        })
    }, [dispatch, requestServer, params.id, isCreating]);

    if (isLoading && !isCreating) {
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
                        <PostContent id={params.id} post={post}/>
                    </div>
                    <div className={styles.container}>
                        <Comments comments={post.comments} postId={post.id} />
                    </div>
                </>
            )
}
    
