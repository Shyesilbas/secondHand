/** Backend {@code UserRole.ADMIN} exposed as {@code "ADMIN"} on /v1/users/me */
export const isAdminUser = (user) => user?.role === 'ADMIN';
