import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useServerRequest } from "../../../../hooks"
import { selectUserRole } from '../../../../selectors'
import { removePostAsync } from '../../../../store/action'
import { ROLE } from '../../../../../shared/constants/index.js';
import { DeleteConfirm } from '../comments/comment/delete-confirm/delete-confirm'
import { Error } from '../../../error/error'
import styles from './special-panel.module.css'
import PropTypes from 'prop-types'


export const SpecialPanel = ({ id, publishedAt, editButton }) => {
    const [isModalWindow, setIsModalWindow] = useState(null)
    const [error, setError] = useState(null)
    const roleId = useSelector(selectUserRole);
    const requestServer = useServerRequest()
    const navigate = useNavigate()

    const dispatch = useDispatch()

    const onPostRemove = (id) => {
        dispatch(removePostAsync(requestServer, id)).then(({ error }) => {
            if (error) { setError(error); return }
            navigate('/')
        });
    }

    return (
        <div className={styles.panel}>
            {[ROLE.ADMIN, ROLE.MODERATOR].includes(roleId) && (
                <>
                    <p>{publishedAt}</p>
                    <div className={styles.containerButton}>
                        {editButton}
                        {publishedAt && (
                            <>
                                <button className={styles.buttonDelete}
                                    title="Удалить статью" type="button"
                                    onClick={() => setIsModalWindow('delete')} />
                                {isModalWindow === 'delete' && (
                                    <DeleteConfirm
                                        text="Удалить статью?"
                                        onConfirm={() => { onPostRemove(id); setIsModalWindow(null) }}
                                        onCancel={() => setIsModalWindow(null)}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
            {error && <Error error={error} />}
        </div>
    )
}

SpecialPanel.propTypes = {
    id: PropTypes.string,
    publishedAt: PropTypes.string,
    editButton: PropTypes.node.isRequired,
}
