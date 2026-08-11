import { App } from '../App/App'
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UserRow } from "./components";
import { useServerRequest } from "../../hooks";
import styles from './Users.module.css';


export const Users = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null)
    const dispatch = useDispatch()
    const requestServer = useServerRequest('fetchRoles');

    useEffect( () => {
        Promise.all([requestServer('fetchRoles'), 
            requestServer('fetchUsers'),
        ]).then(([usersRes, rolesRes]) => {
            if (usersRes.error || rolesRes.error) {
                setErrorMessage(usersRes.error || rolesRes.error)
                return;
            }
            setUsers(usersRes.res)
            setRoles(rolesRes.res)
        });
        requestServer('fetchRoles').then(({ error, res }) => {
            if (error) {
                return;
            }
            setRoles(res)
        });
        requestServer('fetchUsers')
    }, []);

    return (
        <section className={styles.container}>
            <App />
            {errorMessage ? (
                <>
                    <h2>Ошибка</h2>
                    <p>{errorMessage}</p>
                </>
            ) : (
                <>
                    <h2 className={styles.article}>Пользователи</h2>
                    <div className={styles.roles}>
                        <div>Логин</div>
                        <div>Дата регистрации</div>
                        <div>Роль</div>
                    </div>
                    <div>
                        {users.map(({ id, login, registeredAt, roleId }) => (
                            <UserRow key={id} login={login} registeredAt={registeredAt} roleId={roleId} roles={roles} />
                        ))}
                    </div>
                    <button className={""} onClick={() => dispatch(/* TODO */)} />
                </>
            )}
        </section>
    );
}