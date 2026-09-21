import styles from './pagination.module.css'
import PropTypes from 'prop-types'

export const Pagination = ({page, lastPage, setPage}) => {
    return (
        <div className={styles.pagination}>
            <button className={styles.arrow} disabled={page === 1} onClick={() => { setPage(1) }}>
                <img src="/Post/icons/pagination/Left_square.svg" alt="В начало" />
            </button>
            <button className={styles.arrow} disabled={page === 1} onClick={() => { setPage(page - 1) }}>
                <img src="/Post/icons/pagination/Left 2.svg" alt="Назад" />
            </button>
            <div className={styles.pages}>
                <div className={`${styles.page} ${styles.active}`}>{page}</div>
            </div>
            <button className={styles.arrow} disabled={page === lastPage} onClick={() => { setPage(page + 1) }}>
                <img src="/Post/icons/pagination/Right 2.svg" alt="Вперёд" />
            </button>
            <button className={styles.arrow} disabled={page === lastPage} onClick={() => { setPage(lastPage) }}>
                <img src="/Post/icons/pagination/Right_square.svg" alt="В конец" />
            </button>
        </div>
    )
}

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    lastPage: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
}