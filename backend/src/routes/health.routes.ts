import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {

    res.json({

        success: true,

        uptime: process.uptime(),

        timestamp: new Date(),

        memory: process.memoryUsage(),

        node: process.version,

    });

});

export default router;