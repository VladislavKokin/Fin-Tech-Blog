import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search ,PostCard, Pagination } from './components'
import { Error } from '../error/error'
import { useServerRequest } from '../../hooks'
import { selectUserRole } from '../../selectors'
import { PAGINATION_LIMIT, ROLE } from '../../../shared/constants/index.js'
import { ACTION_TYPE } from '../../store/action/action-type'
import styles from "./posts.module.css";

export const Posts = () => {
    const dispatch = useDispatch()
    const data = useSelector(({ posts }) => posts)
    const { posts, lastPage, error } = data
    const [searchParams, setSearchParams] = useSearchParams()
    const searchPhrase = searchParams.get('search') || ''
    const rawPage = searchParams.get('page') || '1'
    const page = /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1
    const roleId = useSelector(selectUserRole)
    const requestServer = useServerRequest()

    useEffect(() => {
        if (data.loaded && data.page === page && data.searchPhrase === searchPhrase) return
        let active = true
        const timer = setTimeout(() => {
            requestServer('fetchPosts', searchPhrase, page, PAGINATION_LIMIT).then(({ error, res }) => {
                if (!active) return
                dispatch({ type: ACTION_TYPE.SET_POSTS_DATA, payload: error
                    ? { posts: [], lastPage: 1, page, searchPhrase, error }
                    : { ...res, error: null }
                })
            })
        }, 350)
        return () => { active = false; clearTimeout(timer) }
    }, [requestServer, dispatch, page, searchPhrase, data.loaded, data.page, data.searchPhrase])

    const onSearch = ({target}) => {
        setSearchParams({ ...(target.value ? { search: target.value } : {}), page: '1' }, { replace: true })
    }

    const setPage = (nextPage) => setSearchParams({ ...(searchPhrase ? { search: searchPhrase } : {}), page: String(nextPage) })

    const cardsKey = posts.map(({ id }) => id).join()

    return (
        <section className={styles.container}>
            <Search searchPhrase={searchPhrase} onChange={onSearch} />
            {roleId === ROLE.ADMIN && (
                <Link className={styles.buttonCreate} to="/post" />
            )}
            <AnimatePresence mode="wait" initial={false}>
                {posts.length > 0 ? (
                    <motion.div
                        key={cardsKey}
                        className={styles.cards}
                        initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -60, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                        {posts.map(({ id, imageUrl, title, publishedAt, commentsCount }) => (
                            <PostCard
                                key={id}
                                id={id}
                                imageUrl={imageUrl}
                                title={title}
                                publishedAt={publishedAt}
                                commentsCount={commentsCount}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <Error key="empty" error={error || 'Статьи не найдены'} />
                )}
            </AnimatePresence>
            {lastPage > 1 && posts.length > 0 && (
                <Pagination page={page} lastPage={lastPage} setPage={setPage} />
            )}
        </section>
    )
}
