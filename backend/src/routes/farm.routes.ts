import express from "express";
import { createFarm, getFarms } from "../controllers/farm.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = express.Router();
router.use(
  authorizeRoles(
    ROLES.FARM_MANAGER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);
router.post("/", createFarm);
router.get("/", getFarms);

export default router;