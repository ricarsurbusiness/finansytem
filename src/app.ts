import express from "express";
import morgan from "morgan";
import cors from "cors";
import router from "./indexRoutes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api", router);

export default app;
