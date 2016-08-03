export function isAdmin(user) {
    return playsRole(user, 'admin');
}
export function playsRole(user, role) {
    return user && user.roles && user.roles.indexOf('role') >= 0;
}
export function playsRoles(user, roles) {
    for (let role of roles) {
        if (playsRole(user, role)) {
            return true;
        }
    }
    return false;
}
