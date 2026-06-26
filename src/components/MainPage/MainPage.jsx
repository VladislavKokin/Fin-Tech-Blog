import { useState } from 'react';
import { Registretion } from '../Registretion/Registretion'
import styles from './MainPage.module.css';

export const MainPage = () => {
    const [isModalWindow, setIsModalWindow] = useState(false)

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <div className={styles.brand}>
                    <a href=""><img className={styles.icons} src="/header/icon/Logo.svg" alt="Логотип" /></a>
                    <h2 className={styles.textLogo}>FinTech</h2>
                </div>
                <h1 className={styles.heading}>Blog</h1>
                <>  
                    <button className={`${styles.buttonLogin} ${styles.icons}`} title="Авторизация" type="button" 
                        onClick={() => setIsModalWindow(true)} />
                {isModalWindow && <Registretion onClose={() => setIsModalWindow(false)} />}
                </>
            </div>
            <div className={styles.descriptionContainer}>
                <p className={styles.description}>Учимся инвестировать:
                    <img src="/header/image/MainPage/Vector.svg" alt="Фотка мужичка" />
                    просто о деньгахи и росте капитала
                </p>
                <img src="/header/image/MainPage/image 4.svg" alt="" />
                <button className={`${styles.downArrow} ${styles.icons}`} title="Указатель прокрутки" />
            </div>
        </section>
    );
};