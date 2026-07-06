import { Router } from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouse.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(
  authorizeRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);

router.post("/", createWarehouse);
router.get("/", getAllWarehouses);
router.get("/:id", getWarehouseById);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;