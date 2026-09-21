import styles from './search.module.css'
import PropTypes from 'prop-types'

export const Search = ({searchPhrase, onChange}) => {
    return (
        <div className={styles.search}>
            <input className={styles.searchInput} value={searchPhrase} onChange={onChange}type="text" placeholder="Поиск по заголовку" />
            <button className={styles.searchButton} type="button" aria-label="Искать" />
        </div>
    )
}

Search.propTypes = {
    searchPhrase: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}