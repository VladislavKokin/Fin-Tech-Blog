import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { UserRow } from "./components";
import { selectUserRole } from '../../selectors'
import { useServerRequest } from "../../hooks";
import { ROLE } from '../../../shared/constants/index.js';
import { checkAccess } from '../../utils'
import { PrivateContent } from '../private-content/private-content';
import { ACTION_TYPE } from '../../store/action/action-type';
import styles from './users.module.css';

export const Users = () => {
    const dispatch = useDispatch()
    const { users, roles, loaded, error: errorMessage } = useSelector(({ users }) => users)
    const userRole = useSelector(selectUserRole);

    const requestServer = useServerRequest();

    const onUserRemove = (userId) => requestServer('removeUser', userId).then(({ error }) => {
        dispatch({ type: ACTION_TYPE.SET_USERS_DATA, payload: error
            ? { error }
            : { users: users.filter(({ id }) => id !== userId), error: null }
        })
    })

    useEffect( () => {
        if (loaded || !checkAccess([ROLE.ADMIN], userRole)) {
            return
        }

        let active = true
        Promise.all([requestServer('fetchUsers'),
            requestServer('fetchRoles'),
        ]).then(([usersRes, rolesRes]) => {
            if (!active) return
            dispatch({ type: ACTION_TYPE.SET_USERS_DATA, payload: {
                users: usersRes.res || [], roles: rolesRes.res || [], error: usersRes.error || rolesRes.error,
            } })
        })
        return () => { active = false }
    }, [requestServer, dispatch, loaded, userRole]);
 
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
