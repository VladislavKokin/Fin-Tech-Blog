import { createPortal } from 'react-dom'
import styles from './delete-confirm.module.css'
import PropTypes from 'prop-types'

export const DeleteConfirm = ({ text, onConfirm, onCancel }) => {
    return createPortal(
        <div className={styles.overlay} role="presentation" onClick={onCancel}>
            <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-confirm-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="delete-confirm-title" className={styles.title}>{text}</h3>
                <div className={styles.buttons}>
                    <button
                        className={styles.buttonConfirm}
                        type="button"
                        title="Удалить"
                        aria-label="Удалить"
                        onClick={onConfirm}
                    />
                    <button
                        className={styles.buttonCancel}
                        type="button"
                        title="Отмена"
                        aria-label="Отмена"
                        onClick={onCancel}
                    />
                </div>
            </div>
        </div>,
        document.body
    )
}

DeleteConfirm.propTypes = {
    text: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
}
