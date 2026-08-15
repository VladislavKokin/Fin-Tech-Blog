import { useState } from 'react'
import styles from './Pages.module.css'

export const Pages = () => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <section id="pages-section" className={styles.container}>
            <header>
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
                <h2 className={styles.article}>Статьи</h2>
                <div className={styles.articlesMap}></div>
            </header>
        </section>
    )
}