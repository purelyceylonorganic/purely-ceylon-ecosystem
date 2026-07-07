import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

export const hasPermission = (
    role: string,
    permission: string
): boolean => {

    const permissions =
        ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

    return permissions.includes(permission as never);
};