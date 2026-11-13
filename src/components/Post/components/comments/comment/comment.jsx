import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useServerRequest } from "../../../../../hooks"
import { removeComment } from '../../../../../store/action'
import { ROLE } from "../../../../../../shared/constants/index.js"
import { selectUserRole } from "../../../../../selectors"
import { DeleteConfirm } from "./delete-confirm/delete-confirm"
import { Error } from '../../../../error/error'
import styles from "./comment.module.css"
import PropTypes from 'prop-types'

export const Comment = ({ postId, id, author, content, publishedAt }) => {
    const [isModalWindow, setIsModalWindow] = useState(null)
    const [error, setError] = useState(null)
    const dispatch = useDispatch()
    const requestServer = useServerRequest()
    const roleId = useSelector(selectUserRole);

    const onCommentRemove = async (id) => {
        const result = await dispatch(removeComment(requestServer, postId, id))
        setError(result.error)
    }

    return (
        <div className={styles.container}>
            <div className={styles.border}>
                <div className={styles.info}>
                    <div>
                        <button className={styles.buttonUser} onClick={() => { }} />
                        {author}
                    </div>
                    <div>
                        <button className={styles.buttonCalendar} onClick={() => { }} />
                        {publishedAt}
                    </div>
                </div>
                <div className={styles.content}>{content}</div>
            </div>
            {(roleId === ROLE.ADMIN || roleId === ROLE.MODERATOR) && (
                <button className={styles.buttonDelete}
                    title="Удалить комментарий" type="button"
                    onClick={() => setIsModalWindow('delete')} />
            )}
            {isModalWindow === 'delete' && (
                <DeleteConfirm
                    text="Удалить комментарий?"
                    onConfirm={() => { onCommentRemove(id); setIsModalWindow(null) }}
                    onCancel={() => setIsModalWindow(null)}
                />
            )}
            {error && <Error error={error} />}
        </div>
    )
}

Comment.propTypes = {
    postId: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    author: PropTypes.string,
    content: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
}
