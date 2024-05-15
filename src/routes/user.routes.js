import { Router } from 'express';
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route('/login').post(loginUser);

//secured route
userRouter.route('/logout').post(verifyJwt, logoutUser);
userRouter.route('/refresh-token').post(refreshAccessToken);
userRouter.route('/change-password').post(verifyJwt, changeCurrentPassword);

userRouter.route('/current-user').get(verifyJwt, getCurrentUser);

userRouter
  .route('/update-account-details')
  .patch(verifyJwt, updateAccountDetails);
userRouter
  .route('/update-avatar')
  .patch(verifyJwt, upload.single('avatar'), updateUserAvatar);
userRouter
  .route('/update-coverImage')
  .patch(verifyJwt, upload.single('coverImage'), updateUserCoverImage);

userRouter.route('/c/:username').get(verifyJwt, getUserChannelProfile);

userRouter.route('/history').get(verifyJwt, getWatchHistory);

export default userRouter;
