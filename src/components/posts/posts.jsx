import { useEffect, useMemo, useState } from "react";
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search ,PostCard, Pagination } from './components'
import { Error } from '../error/error'
import { useServerRequest } from '../../hooks'
import { selectUserRole } from '../../selectors'
import { PAGINATION_LIMIT, ROLE } from '../../bff/constants'
import { debounce, getLastPageFromLinks } from './utils'
import styles from "./posts.module.css";

export const Posts = () => {
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [shouldSearch, setShouldSearch] = useState('')
    const [searchPhrase, setSearchPhrase] = useState('')
    const roleId = useSelector(selectUserRole)
    const requestServer = useServerRequest()

    useEffect(() => {
        requestServer('fetchPosts', searchPhrase, page, PAGINATION_LIMIT).then(({ res: { posts,links }}) => {
            setPosts(posts)
            setLastPage(getLastPageFromLinks(links))
        })
    }, [requestServer, page, shouldSearch, searchPhrase])

    const startDelayedSearch = useMemo(() => debounce(setShouldSearch, 2000), [])

    const onSearch = ({target}) => {
        setSearchPhrase(target.value)
        startDelayedSearch(!shouldSearch)
    }

    const cardsKey = posts.map(({ id }) => id).join()

    return (
        <section className={styles.container}>
            <Search searchPhrase={searchPhrase} onChange={onSearch} />
            {roleId === ROLE.ADMIN && (
                <Link className={styles.buttonCreate} to="/post" />
            )}
            <AnimatePresence mode="wait">
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
                    <Error key="empty" error="Статьи не найдены" />
                )}
            </AnimatePresence>
            {lastPage > 1 && posts.length > 0 && (
                <Pagination page={page} lastPage={lastPage} setPage={setPage} />
            )}
        </section>
    )
}