import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

router.get(
    "/dashboard",
    protect,
    authorizePermissions(PERMISSIONS.DASHBOARD_VIEW),
    (req, res) => {
        res.json({
            success: true,
            message: "Permission Check Passed"
        });
    }
);

export default router;