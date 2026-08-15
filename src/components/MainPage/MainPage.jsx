import styles from './MainPage.module.css';

export const MainPage = () => {
    return (
        <section className={styles.container}>
            <div className={styles.descriptionContainer}>
                <p className={styles.description}>Учимся инвестировать
                    <img src="/header/image/MainPage/Vector.svg" alt="Черта" />
                    просто о деньгах и росте капитала
                </p>
                <img src="/header/image/MainPage/image 4.svg" alt="Фотка мужичка" />
            </div>
        </section>
    );
};