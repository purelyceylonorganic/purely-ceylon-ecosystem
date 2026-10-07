import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Purely Ceylon Enterprise API",
      version: "1.0.0",
      description:
        "Enterprise B2B Wholesale Export Management API",
    },

    servers: [
      {
        url: "https://purely-ceylon-ecosystem-production.up.railway.app/api/v1",
        description: "Production API",
      },
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Development",
      },
    ],
  },

  apis: [
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export {
  swaggerUi,
};