import express from "express";
import {
 createCertificate,
 getCertificates
} from "../controllers/certificate.controller";

const router = express.Router();

router.post("/", createCertificate);
router.get("/", getCertificates);

export default router;