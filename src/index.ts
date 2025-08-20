import express from "express";
import app from "./app";
import { prisma } from "../database/pgConfig";

const PORT = process.env.PORT || 3000;

(async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
})();
