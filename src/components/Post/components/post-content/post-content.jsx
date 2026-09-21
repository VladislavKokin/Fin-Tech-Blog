import { useNavigate } from 'react-router-dom'
import { SpecialPanel } from '../special-panel/special-panel'
import styles from './post-content.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../../../constants'

export const PostContent = ({id, post}) => {   
    const navigate = useNavigate()

    return (
        <div>
            <h2 className={styles.article}>{post.title}</h2>
            <SpecialPanel id={post.id} publishedAt={post.publishedAt} editButton={<button className={styles.buttonChange} onClick={() => navigate(`/post/${id}/edit`)} />} />
            <div className={styles.contentIntroduction}>
                <div className={styles.contentIntroductionBorder}>{post.content.introduction}</div>
                {post.imageUrl && (
                    <img className={styles.postImage} src={post.imageUrl} alt={post.title} />
                )}
            </div>
            <div className={styles.contentBody}>{post.content.body}</div>
            <div className={styles.contentConclusion}>{post.content.conclusion}</div>
            <p className={styles.data}>{post.publishedAt}</p>
            <p className={styles.annotation}>Не является индивидуальной инвестиционной рекомендацией.</p>
        </div>
    )
}

PostContent.propTypes = {
    id: PropTypes.string.isRequired,
    post: PROP_TYPE.POST.isRequired,
}