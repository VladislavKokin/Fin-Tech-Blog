import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styles from './footer.module.css'

export const Footer = () => {
    const [city, setCity] = useState('')
    const [temperature, setTemperature] = useState(null)
    const [weather, setWeather] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const dateLabel = useSelector(({ runtime }) => runtime.dateLabel)

    useEffect(() => {
        fetch('/api/weather')
            .then((res) =>res.json())
            .then(({ data }) => {
                if (!data) return
                setCity(data.city)
                setTemperature(data.temperature)
                setWeather(data.description)
            })
            .catch(() => {})
            .finally(() => setIsLoading(false))
    }, []);

    return (
        <section className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div className={styles.brand}>
                        <a href=""><img className={styles.icons} src="/header/icon/Logo.svg" alt="Логотип" /></a>
                        <h2 className={styles.textLogo}>FinTech</h2>
                    </div>
                    <div>
                        <a className={styles.emailLink} href="mailto:fin-tech@finance.com">fin-tech@finance.com</a>
                    </div>
                </div>
            </div>
            <div className={styles.weatherCard}>
                    <div className={styles.weatherText}>
                        <span className={styles.weatherLabel}>Погода сейчас</span>
                        <div className={styles.weatherCity}>
                            {city}, {dateLabel}
                        </div>
                        <div className={styles.weatherDetails}>
                            {temperature !== null ? `${temperature}°C, ${weather}` : isLoading ? 'Загрузка...' : 'Недоступно'}
                        </div>
                    </div>
                    <div className={styles.weatherBadge}>
                        {temperature !== null ? `${temperature}°` : '—'}
                    </div>
            </div>
        </section>
    )
}
