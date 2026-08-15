import { useState } from "react";
import { useServerRequest } from '../../../../hooks'
import styles from './user-row.module.css'

export const UserRow = ({ id, login, registeredAt, roleId: userRoleId, roles, onUserRemove }) => {
    const [initialRoleId, setInitialRoleId] = useState(userRoleId)
    const [selectedRoleId, setSelectedRoleId] = useState(userRoleId);
    const requestServer = useServerRequest();

    const onRoleChange = ({ target }) => setSelectedRoleId(Number(target.value));
    const onRoleSave = ( userId, newUserRoleId ) => requestServer('updateUserRole', userId, newUserRoleId).then(() => {
        setInitialRoleId(newUserRoleId)
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
        </div>
    )
}