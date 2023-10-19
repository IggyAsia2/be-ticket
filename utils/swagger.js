const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          // in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    info: {
      title: "Diary API",
      description: "Diary API Information",
      contact: {
        name: "Xuân Bảo",
      },
      server: ["http://localhost:3000"],
    },
  },
  apis: ["./routes/swagger/**/*.yaml"],
};

module.exports = swaggerOptions;
