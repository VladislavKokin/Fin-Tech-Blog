import { Comment } from './comment/comment'
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useServerRequest } from '../../../../hooks'
import { selectUserId, selectUserRole } from '../../../../selectors'
import { ROLE } from '../../../../bff/constants'
import { addComment } from '../../../../store/action'
import styles from './comments.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../../../constants'

export const Comments = ({comments, postId}) => {
    const [newComment, setNewComment] = useState('')
    const userId = useSelector(selectUserId)
    const userRole = useSelector(selectUserRole)


    const dispatch = useDispatch()

    const requestServer = useServerRequest()

    const onNewCommentAdd = (userId, postId, content) => {
        dispatch(addComment(requestServer, userId, postId, content))
        setNewComment('')
    }

    const isGuest = userRole === ROLE.GUEST;

    return(
        <div>
            {!isGuest &&
                (<div className={styles.newComment}>
                    <textarea className={styles.commentInput} name='comment' value={newComment} placeholder='Комментарий...' onChange={({ target }) => setNewComment(target.value)} />
                    <button className={styles.buttonSend} onClick={() => onNewCommentAdd(userId, postId, newComment)} />
                </div>
            )}
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