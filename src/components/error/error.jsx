import { motion } from 'framer-motion'
import styles from './error.module.css'
import PropTypes from 'prop-types'

export const Error = ({ error }) =>
    error && (
        <motion.div
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <img className={styles.image} src="/404/404.svg" alt="Ошибка" />
            <p>{error}</p>
        </motion.div>
    )

Error.propTypes = {
    error: PropTypes.string,
}