import { ROLES } from "../constants/roles";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

export const seedPermissions = async () => {

    console.log("=================================");
    console.log("PERMISSION SEED");
    console.log("=================================");

    Object.entries(ROLE_PERMISSIONS).forEach(([role, permissions]) => {

        console.log(role);

        permissions.forEach(permission => {

            console.log("   ✔", permission);

        });

    });

    console.log("=================================");
    console.log("Permission Seed Completed");
    console.log("=================================");
};