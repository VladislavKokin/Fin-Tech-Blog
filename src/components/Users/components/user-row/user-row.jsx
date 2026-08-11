import { useDispatch } from "react-redux";

export const UserRow = ({ login, registeredAt, roleId: userRoleId }) => {
    const dispatch = useDispatch();
    const roles = [];

    return (
        <div className="">
            <div className="">
                <div className="">{login}</div>
                <div className="">{registeredAt}</div>
                <select className="" value={userRoleId} /*onChange={(e) => updateUserRole(userId, e.target.value)}*/>
                    {roles.map(({ id: roleId, name: roleName }) => (
                        <option key={roleId} value={roleId}>{roleName}</option>
                    ))}
                </select>
                <button className="" onClick={() => dispatch(/* TODO */)} />
            </div>
            <button className="" onClick={() => dispatch(/* TODO */)} />
        </div>
    )
}