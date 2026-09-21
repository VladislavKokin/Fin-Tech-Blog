import { Link } from "react-router-dom"
import styles from './post-card.module.css'
import PropTypes from 'prop-types'

export const PostCard = ({ id, imageUrl, title, publishedAt, commentsCount }) => {
    return (
        <div className={styles.card}>
            <Link className={styles.link} to={`/post/${id}`}>
                <img className={styles.image} src={imageUrl} alt={title} />
                <div className={styles.title}>
                    <h5>{title}</h5>
                </div>
                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <img src="/Post/icons/Calendar.svg" alt="Дата публикации" />
                        {publishedAt}
                    </div>
                    <div className={styles.metaItem}>
                        {commentsCount}
                        <img src="/Post/icons/Message square.svg" alt="Кол-во комментариев" />
                    </div>
                </div>
            </Link>
        </div>
    )
}

PostCard.propTypes = {
    id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
    commentsCount: PropTypes.number.isRequired,
}