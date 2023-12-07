import { Router } from "express";
import UserController from "../controllers/user-controller";
import AuthenMiddleware from "../middlewares/authen-middleware";

const router = Router();

router.post('/sign-up',UserController.createUser);
router.post('/login',UserController.loginUser);
router.get('/follower',AuthenMiddleware.authenMiddleware,UserController.getFollower);
router.get('/following',AuthenMiddleware.authenMiddleware,UserController.getFollowing);
router.get('/friends', AuthenMiddleware.authenMiddleware, UserController.getFriend);
router.post('/follow',AuthenMiddleware.authenMiddleware,UserController.follow);
router.post('/refresh-access-token',UserController.refreshAccessToken);
router.put('/', AuthenMiddleware.authenMiddleware, UserController.updateUser);
router.get('/:token', UserController.getUserByToken)


export default router;