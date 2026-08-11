import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Authorization } from '../Authorization/Authorization'
import { Registration } from '../Registration/Registration';
import { NavLink } from 'react-router-dom'
import { ROLE } from '../../bff/constants';
import { logout } from '../../store/action'
import { selectUserRole, selectUserLogin, selectUserSession } from '../../selectors'
import styles from './App.module.css'

export const App = ({ children }) => {
    const dispatch = useDispatch()
    const roleId = useSelector(selectUserRole);
    const login = useSelector(selectUserLogin);
    const session = useSelector(selectUserSession)
    const [isModalWindow, setIsModalWindow] = useState(null)

    return (
        <section>
            <div className={styles.container}>
                <div className={roleId === ROLE.GUEST ? styles.headerGuest : styles.headerUser}>
                    <div className={styles.brand}>
                        <a href=""><img className={styles.icons} src="/header/icon/Logo.svg" alt="Логотип" /></a>
                        <h2 className={styles.textLogo}>FinTech</h2>
                    </div>
                    <nav className={styles.heading} aria-label="Основная навигация">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
                        >
                            Главная
                        </NavLink>
                        <NavLink
                            to="/pages"
                            end
                            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
                        >
                            Статьи
                        </NavLink>
                        {roleId === ROLE.ADMIN && (
                            <NavLink
                                to="/users"
                                className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
                            >
                                Пользователи
                            </NavLink>
                        )}
                    </nav>
                    <>
                        {roleId === ROLE.GUEST
                            ? (
                                <>
                                    <button
                                        className={`${styles.buttonLogin} ${styles.icons}`}
                                        title="Авторизация"
                                        type="button"
                                        onClick={() => setIsModalWindow('auth')}
                                    />
                                </>
                            ) : (
                                <>
                                    <p className={styles.login}>{login}</p>
                                    <button
                                        className={`${styles.buttonLoginout} ${styles.icons}`}
                                        title="Выйти"
                                        type="button"
                                        onClick={() => dispatch(logout(session))}
                                    />
                                </>
                            )
                        }
                        {isModalWindow === 'auth' && (
                            <Authorization
                                onClose={() => setIsModalWindow(null)}
                                onSwitch={() => setIsModalWindow('register')}
                            />
                        )}
                        {isModalWindow === 'register' && (
                            <Registration
                                onClose={() => setIsModalWindow(null)}
                                onSwitch={() => setIsModalWindow('auth')}
                            />
                        )}
                    </>
                </div>
            </div>
            <main className={styles.content}>{children}</main>
        </section>
    )
}