import { App } from '../App/App'
import styles from './MainPage.module.css';

export const MainPage = () => {
    return (
        <section className={styles.container}>
            <App />
            <div className={styles.descriptionContainer}>
                <p className={styles.description}>Учимся инвестировать
                    <img src="/header/image/MainPage/Vector.svg" alt="Черта" />
                    просто о деньгахи и росте капитала
                </p>
                <img src="/header/image/MainPage/image 4.svg" alt="Фотка мужичка" />
            </div>
        </section>
    );
};