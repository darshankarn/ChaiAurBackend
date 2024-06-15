import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { getVideoById, publishVideo, updateVideo } from '../controllers/video.controller.js';

const videoRouter = Router();
videoRouter.use(verifyJwt);

videoRouter.route('/publish-video').post(
  upload.fields([
    {
      name: 'videoFile',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  publishVideo
);

videoRouter.route('/c/:videoId').get(getVideoById);
videoRouter.route('/c/update-video/:videoId').patch(
  upload.fields([
    {
      name: 'videoFile',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  updateVideo
)

export default videoRouter;
