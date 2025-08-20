import { Router } from "express";
import registerRoutes from "./modules/auth/register/routes/user.routes";

const routes: Router = Router();

routes.use(registerRoutes);

export default routes;
