import { Comment } from './comment/comment'
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useServerRequest } from '../../../../hooks'
import { selectUserId, selectUserRole } from '../../../../selectors'
import { ROLE } from '../../../../../shared/constants/index.js'
import { addComment } from '../../../../store/action'
import { Error } from '../../../error/error'
import styles from './comments.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../../../constants'

export const Comments = ({comments, postId}) => {
    const [newComment, setNewComment] = useState('')
    const [error, setError] = useState(null)
    const [isSending, setIsSending] = useState(false)
    const userId = useSelector(selectUserId)
    const userRole = useSelector(selectUserRole)


    const dispatch = useDispatch()

    const requestServer = useServerRequest()

    const onNewCommentAdd = async (userId, postId, content) => {
        if (isSending) return
        setIsSending(true)
        setError(null)
        const result = await dispatch(addComment(requestServer, userId, postId, content))
        setIsSending(false)
        if (result.error) { setError(result.error); return }
        setNewComment('')
    }

    const isGuest = userRole === ROLE.GUEST;

    return(
        <div>
            {!isGuest &&
                (<div className={styles.newComment}>
                    <textarea className={styles.commentInput} name='comment' value={newComment} placeholder='Комментарий...' onChange={({ target }) => setNewComment(target.value)} />
                    <button className={styles.buttonSend} onClick={() => onNewCommentAdd(userId, postId, newComment)} disabled={isSending} />
                </div>
            )}
            {error && <Error error={error} />}
            <div className={styles}>
                {comments.map(({ id, author, content, publishedAt }) => (
                    <Comment
                        key={id}
                        id={id}
                        postId={postId}
                        author={author}
                        content={content}
                        publishedAt={publishedAt}
                    />
                ))}
            </div>
        </div>
    )
}

Comments.propTypes = {
    comments: PropTypes.arrayOf(PROP_TYPE.COMMENT).isRequired,
    postId: PropTypes.string.isRequired,
}
