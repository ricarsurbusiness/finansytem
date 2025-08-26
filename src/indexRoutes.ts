import { Router } from "express";
import registerRoutes from "./modules/auth/register/routes/user.routes";
import loginRoutes from "./modules/auth/login/routes/login.routes";
import usersProviderRoutes from "./modules/usersProvider/routes/usersProvider.routes";

const routes: Router = Router();

routes.use(registerRoutes);
routes.use(loginRoutes);
routes.use(usersProviderRoutes);

export default routes;
