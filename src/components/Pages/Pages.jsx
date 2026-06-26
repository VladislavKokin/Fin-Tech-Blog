import styles from './Pages.module.css'

export const Pages = () => {
    return (
        <section className={styles.container}>
            <header>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Поиск"
                        className={styles.searchInput}
                    />
                    <button className={styles.searchButton} type="button" />
                </div>
                <div>
                    <h2>Статьи</h2>
                </div>
            </header>
        </section>
    )
}