import { Comment } from './comment/comment'
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useServerRequest } from '../../../../hooks'
import { selectUserId } from '../../../../selectors'
import { addComment } from '../../../../store/action'
import styles from './comments.module.css'

export const Comments = ({comments, postId}) => {
    const [newComment, setNewComment] = useState('')
    const userId = useSelector(selectUserId)
    const dispatch = useDispatch()
    const requestServer = useServerRequest()

    const onNewCommentAdd = (userId, postId, content) => {
        dispatch(addComment(requestServer, userId, postId, content))
        setNewComment('')
    }

    return(
        <div>
            <div className={styles.newComment}>
                <textarea className={styles.commentInput} name='comment' value={newComment} placeholder='Комментарий...' onChange={({ target })=>setNewComment(target.value)} />
                <button className={styles.buttonSend} onClick={() => onNewCommentAdd(userId, postId, newComment)} />
            </div>
            <div className={styles}>
                {comments.map(({ id, author, content, publishedAt }) => (
                    <Comment
                        key={id}
                        id={id}
                        author={author}
                        content={content}
                        publishedAt={publishedAt}
                    />
                ))}
            </div>
        </div>
    )
}