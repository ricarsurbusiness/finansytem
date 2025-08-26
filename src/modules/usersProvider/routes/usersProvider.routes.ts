import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth.middleware";
import {
  createProvider,
  updateUserProvider,
  getAllUserProviders,
  getUserProvidersById,
  deleteUserProvider,
} from "../controllers/userProvider.controllers";

const router = Router();

router.post("/addProvider", authenticateToken, createProvider);
router.put("/updateProvider/:id", authenticateToken, updateUserProvider);
router.get("/getAllProviders", authenticateToken, getAllUserProviders);
router.get("/getProvider/:id", authenticateToken, getUserProvidersById);
router.delete("/deleteProvider/:id", authenticateToken, deleteUserProvider);

export default router;
