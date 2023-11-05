import { Router } from "express";
import UserController from "../controllers/user-controller";
import AuthenMiddleware from "../middlewares/authen-middleware";

const router = Router();

router.post('/sign-up',UserController.createUser);
router.post('/login',UserController.loginUser);
router.get('/test',AuthenMiddleware.authenMiddleware,UserController.test);
router.post('/refresh-access-token',UserController.refreshAccessToken);
router.post('/follow',UserController.follow)

export default router;