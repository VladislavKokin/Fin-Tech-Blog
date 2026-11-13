import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { useServerRequest } from '../../../../hooks'
import { setUser } from '../../../../store/action/set-user'
import { ACTION_TYPE } from '../../../../store/action/action-type'
import { Error } from '../../../error/error'
import styles from './user-row.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../../../constants'

export const UserRow = ({ id, login, registeredAt, roleId: userRoleId, roles, onUserRemove }) => {
    const [initialRoleId, setInitialRoleId] = useState(userRoleId)
    const [selectedRoleId, setSelectedRoleId] = useState(userRoleId);
    const [error, setError] = useState(null)
    const dispatch = useDispatch()
    const user = useSelector(({ user }) => user)
    const users = useSelector(({ users }) => users.users)
    const requestServer = useServerRequest();

    const onRoleChange = ({ target }) => setSelectedRoleId(Number(target.value));
    const onRoleSave = ( userId, newUserRoleId ) => requestServer('updateUserRole', userId, newUserRoleId).then(({ error }) => {
        setError(error)
        if (error) return
        setInitialRoleId(newUserRoleId)
        dispatch({ type: ACTION_TYPE.SET_USERS_DATA, payload: {
            users: users.map((item) => item.id === userId ? { ...item, roleId: newUserRoleId } : item),
        } })
        if (user.id === userId) dispatch(setUser({ ...user, roleId: newUserRoleId }))
    });


    return (
        <div className={styles.row}>
            <div className={styles.cell}>{login}</div>
            <div className={styles.cell}>{registeredAt}</div>
            <div className={styles.cell}>
                <select className={styles.select} value={selectedRoleId} 
                    onChange={ onRoleChange }>
                    {roles.map(({ id: roleId, name: roleName }) => (
                        <option key={roleId} value={roleId}>{roleName}</option>
                    ))}
                </select>
            </div>
            <div className={styles.actions}>
                <button className={styles.buttonSave} onClick={() => onRoleSave(id, selectedRoleId) } 
                    disabled={selectedRoleId===initialRoleId} />
                <button className={styles.buttonDelete} onClick={onUserRemove}/>
            </div>
            {error && <Error error={error} />}
        </div>
    )
}

UserRow.propTypes = {
    id: PropTypes.string.isRequired,
    login: PropTypes.string.isRequired,
    registeredAt: PropTypes.string.isRequired,
    roleId: PROP_TYPE.ROLE_ID.isRequired,
    roles: PROP_TYPE.ROLES.isRequired,
    onUserRemove: PropTypes.func.isRequired,
}
