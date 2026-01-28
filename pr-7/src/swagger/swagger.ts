import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Students API",
      version: "1.0.0",
      description: "REST API for managing students with authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Student: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "John Doe" },
            age: { type: "integer", example: 20 },
            group: { type: "integer", example: 101 },
          },
        },
        StudentInput: {
          type: "object",
          required: ["name", "age", "group"],
          properties: {
            name: { type: "string", example: "John Doe" },
            age: { type: "integer", minimum: 16, maximum: 100, example: 20 },
            group: { type: "integer", example: 101 },
          },
        },
        StudentUpdate: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Doe" },
            age: { type: "integer", minimum: 16, maximum: 100, example: 21 },
            group: { type: "integer", example: 102 },
          },
        },
        UserRegistration: {
          type: "object",
          required: ["name", "surname", "email", "password"],
          properties: {
            name: { type: "string", example: "John" },
            surname: { type: "string", example: "Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 6, example: "password123" },
            roleId: { type: "integer", example: 3 },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                surname: { type: "string" },
                email: { type: "string" },
                role: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                  },
                },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            details: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Students", description: "Student management endpoints" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
