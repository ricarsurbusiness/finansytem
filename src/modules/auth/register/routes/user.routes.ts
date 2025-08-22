import {
  RegisterUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controllers";
import { Router } from "express";
import { authenticateToken } from "../../../../middleware/auth.middleware";

const router = Router();

router.post("/register", RegisterUser);
router.get("/users", authenticateToken, getAllUsers);
router.get("/users/:id", authenticateToken, getUserById);
router.patch("/users/:id", authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, deleteUser);

export default router;
