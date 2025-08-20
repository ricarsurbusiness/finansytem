import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export default app;
