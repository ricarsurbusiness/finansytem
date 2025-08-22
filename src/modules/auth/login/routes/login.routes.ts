import {
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/login.controllers";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

export default router;
