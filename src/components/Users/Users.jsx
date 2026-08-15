import { useState, useEffect } from 'react';
import { UserRow } from "./components";
import { useServerRequest } from "../../hooks";
import styles from './Users.module.css';
import { ROLE } from '../../bff/constants';


export const Users = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([]);
    const [shouldUpdateUserList, setShouldUpdateUserList] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const requestServer = useServerRequest();

    const onUserRemove = (userId) => requestServer('removeUser', userId).then(() => {
        setShouldUpdateUserList(!shouldUpdateUserList)
        
    })

    useEffect( () => {
        Promise.all([requestServer('fetchUsers'), 
            requestServer('fetchRoles'),
        ]).then(([usersRes, rolesRes]) => {
            if (usersRes.error || rolesRes.error) {
                setErrorMessage(usersRes.error || rolesRes.error)
                return;
            }
            setUsers(usersRes.res)
            setRoles(rolesRes.res)
        },
    );
    }, [requestServer, shouldUpdateUserList]);

    return (
        <section className={styles.container}>
            {errorMessage ? (
                <>
                    <h2>Ошибка</h2>
                    <p>{errorMessage}</p>
                </>
            ) : (
                <>
                    <h2 className={styles.article}>Пользователи</h2>
                    <div className={styles.table}>
                        <div className={styles.roles}>
                            <div className={styles.headerCell}>Логин</div>
                            <div className={styles.headerCell}>Дата регистрации</div>
                            <div className={styles.headerCell}>Роль</div>
                            <div className={styles.headerAction}>Действия</div>
                        </div>
                        <div className={styles.rows}>
                            {users.map(({ id, login, registeredAt, roleId }) => (
                                <UserRow key={id} id={id} login={login} registeredAt={registeredAt} roleId={roleId} 
                                    roles={roles.filter(({id: roleId}) => roleId !== ROLE.GUEST)} onUserRemove={() => onUserRemove(id)} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}