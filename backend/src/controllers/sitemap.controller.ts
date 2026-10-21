import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const SITE_URL = (
  process.env.SITE_URL || "https://purely-ceylon-organic.vercel.app"
).replace(/\/$/, "");

// 🗺️ Published product பக்கங்களின் sitemap (Google-க்காக)
export const getProductsSitemap = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, status: "PUBLISHED", deletedAt: null },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    const urls = products
      .map(
        (p) =>
          `  <url>\n    <loc>${SITE_URL}/products/${encodeURIComponent(p.id)}</loc>\n    <lastmod>${p.updatedAt.toISOString()}</lastmod>\n  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    return res.status(500).send("Sitemap unavailable");
  }
};