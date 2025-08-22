import { Router } from "express";
import registerRoutes from "./modules/auth/register/routes/user.routes";
import loginRoutes from "./modules/auth/login/routes/login.routes";

const routes: Router = Router();

routes.use(registerRoutes);
routes.use(loginRoutes);

export default routes;
