import { Comments, PostContent } from './components';
import { useServerRequest } from '../../hooks';
import { loadPost } from '../../store/action'
import { selectPost, selectUserRole } from '../../selectors'
import { ROLE } from '../../bff/constants';

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styles from './Post.module.css'


export const Post = () => {
    const [searchValue, setSearchValue] = useState('');
    const post = useSelector(selectPost);
    const roleId = useSelector(selectUserRole);
    const dispatch = useDispatch();
    const params = useParams();
    const requestServer = useServerRequest()

    useEffect(() => {
        dispatch(loadPost(requestServer, params.id))
    }, [dispatch, requestServer, params.id])

    return (
        <section>
            <div id="pages-section" className={styles.container}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Поиск"
                        className={styles.searchInput}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button className={styles.searchButton} type="button"
                    // onClick={() => dispatch(requestSearch(searchValue))}
                    />
                </div>
                {[ROLE.ADMIN, ROLE.MODERATOR].includes(roleId) && (
                    <div className={styles.containerButton}>
                        <button className={styles.buttonChange} onClick={() => { }} />
                        <button className={styles.buttonDelete} onClick={() => { }} />
                    </div>
                )}
                <h2 className={styles.article}>{post.title}</h2>
                <div className={styles.contentIntroduction}>
                    <div className={styles.contentIntroductionBorder}>{post.content.introduction}</div>
                    <img className={styles.postImage} src={post.imageUrl} alt={post.title} />
                </div>
                <div className={styles.contentBody}>{post.content.body}</div>
                <div className={styles.contentConclusion}>{post.content.conclusion}</div>
                <p className={styles.data}>{post.publishedAt}</p>
                <p className={styles.annotation}>Не является индивидуальной инвестиционной рекомендацией.</p>
            </div>
            <div className={styles.container}>
                <PostContent post={post} />
                <Comments comments={post.comments} postId={post.id}/>
            </div>
        </section>
    )
}