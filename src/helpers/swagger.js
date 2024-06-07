import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import Logger from "../core/Logger.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BDCOM",
      version: "1.0.0",
      description: "Task REST API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],

    host: "localhost:300/api/v1",
    tags: [
      {
        name: "Auth",
        description: "Authentication related endpoints",
      },
      {
        name: "Profile",
        description: "User profile related endpoints",
      },
      {
        name: "News",
        description: "News related endpoints",
      },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default function swaggerDocs(app, port) {
  try {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    Logger.info(`Docs available at http://localhost:${port}/docs`);
  } catch (error) {
    console.log(error);
  }
}
