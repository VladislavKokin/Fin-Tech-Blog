import { useEffect, useState } from 'react'
import styles from './Footer.module.css'

export const Footer = () => {
    const [city, setCity] = useState('')
    const [temperature, setTemperature] = useState('')
    const [weather, setWeather] = useState('')

    useEffect(() => {
        fetch('https://api.openweathermap.org/data/2.5/weather?q=Ukhta,RU&units=metric&lang=ru&appid=b51437834034020b1452b76ee639987e')
            .then((res) =>res.json())
            .then(({ name, main, weather }) => {
                setCity(name)
                setTemperature(Math.round(main.temp))
                setWeather(weather[0].description)
            })
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
                            {city}, {new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                        </div>
                        <div className={styles.weatherDetails}>
                            {temperature ? `${temperature}°C, ${weather}` : 'Загрузка...'}
                        </div>
                    </div>
                    <div className={styles.weatherBadge}>
                        {temperature ? `${temperature}°` : '—'}
                    </div>
            </div>
        </section>
    )
}