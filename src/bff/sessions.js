export const sessions = {
    list: {},
    create(user) {
        const hash = Math.random().toFixed(50);

        this.list[hash] = user

        return hash
    },
    add(hash,user) {
        this.list[hash] = user;
    },
    remove(hash) {
        delete this.list[hash];
    },
    access (userSession, accessRoles) {
    const user = this.list[userSession];

    return !!user && accessRoles.includes(user.roleId)
    },
}