import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Authorization } from '../authorization/authorization'
import { Registration } from '../registration/registration';
import { Error } from '../error/error';
import { NavLink } from 'react-router-dom'
import { ROLE } from '../../../shared/constants/index.js';
import { logout } from '../../store/action'
import { selectUserRole, selectUserLogin } from '../../selectors'
import styles from './header.module.css'

export const Header = () => {
    const dispatch = useDispatch()
    const roleId = useSelector(selectUserRole);
    const login = useSelector(selectUserLogin);
    const [logoutError, setLogoutError] = useState(null)
    const [isModalWindow, setIsModalWindow] = useState(null)

    const onLogout = async () => {
        const result = await dispatch(logout())
        setLogoutError(result.error)
    }

    return (
            <section className={styles.container}>
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
                            to="/posts"
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
                                        title={logoutError || 'Выйти'}
                                        type="button"
                                        onClick={onLogout}
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
                            />
                        )}
                    </>
                </div>
                {logoutError && <Error error={logoutError} />}
            </section>
    )
}
