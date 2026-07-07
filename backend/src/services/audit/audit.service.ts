import { PrismaClient } from "@prisma/client";
import { logger } from "../../config/logger";

const prisma = new PrismaClient();

export const createAuditLog = async ({
    userId,
    userEmail,
    action,
    module,
    entityId,
    description,
    ipAddress,
    userAgent
}:{
    userId?: string;
    userEmail?: string;
    action: string;
    module: string;
    entityId?: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
}) => {

    // 💡 Task 9: Audit DB-ல் save செய்யும் முன் வின்ஸ்டன் லாகரில் பதிவு செய்யப்படுகிறது
    logger.info({
        event: "AUDIT",
        action,
        userId,
    });

    // 🗄️ தரவுத்தளத்தில் Audit Log உருவாக்கப்படுகிறது
    return prisma.auditLog.create({
        data: {
            userId,
            userEmail,
            action,
            module,
            entityId,
            description,
            ipAddress,
            userAgent
        }
    });
};