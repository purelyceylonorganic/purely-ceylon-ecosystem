import { PrismaClient } from "@prisma/client";

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
    userId?:string;
    userEmail?:string;
    action:string;
    module:string;
    entityId?:string;
    description?:string;
    ipAddress?:string;
    userAgent?:string;
})=>{

    return prisma.auditLog.create({
        data:{
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