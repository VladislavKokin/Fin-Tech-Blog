import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { UserRow } from "./components";
import { selectUserRole } from '../../selectors'
import { useServerRequest } from "../../hooks";
import { ROLE } from '../../bff/constants';
import { checkAccess } from '../../utils'
import { PrivateContent } from '../private-content/private-content';
import styles from './Users.module.css';

export const Users = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([]);
    const [shouldUpdateUserList, setShouldUpdateUserList] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const userRole = useSelector(selectUserRole);

    const requestServer = useServerRequest();

    const onUserRemove = (userId) => requestServer('removeUser', userId).then(() => {
                if (! checkAccess([ROLE.ADMIN], userRole)) {
            return
        }

        requestServer('removeUser', userId).then(() => {
            setShouldUpdateUserList(!shouldUpdateUserList)
        })
    });

    useEffect( () => {
        if (! checkAccess([ROLE.ADMIN], userRole)) {
            return
        }

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
    }, [requestServer, shouldUpdateUserList, userRole]);
 
    return (
        <section className={styles.container}>
            <PrivateContent access={[ROLE.ADMIN]} serverError={errorMessage}>
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
                                roles={roles.filter(({ id: roleId }) => roleId !== ROLE.GUEST)} onUserRemove={() => onUserRemove(id)} />
                        ))}
                    </div>
                </div>
            </PrivateContent>
        </section>
    );
}