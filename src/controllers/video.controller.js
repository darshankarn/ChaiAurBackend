import { Video } from '../models/video.model.js';
import { ApiError } from '../utills/ApiError.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { asyncHandler } from '../utills/asyncHandler.js';
import { uploadOnCloudinary } from '../utills/cloudinary.js';

const publishVideo = asyncHandler(async (req, res) => {
  // get title and discription from body
  const { title, discription } = req.body;

  if (!title || !discription) {
    throw new ApiError(400, 'title and discription is required');
  }
  // get video file and thubnail from req.files
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, 'videoFile and thumbnail is required');
  }
  // upload on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(
      500,
      'Something went wrong while uploading in cloudinary'
    );
  }
  // get user from req.user
  const user = req.user;
  // save video to database
  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    discription,
    duration: videoFile?.duration || 5,
    owner: user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'video uploaded successfully'));
});

const getVideoById = asyncHandler(async(req,res)=> {
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(400, 'videoId is required');
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(500,"Something wnet wrong in searching in db");
    }

    return res.status(200).json(
        new ApiResponse(200, video, 'video found successfully') 
    )
})

const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const {title, discription} = req.body;
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files.thumbnail[0]?.path;

    if(!videoId){
        throw new ApiError(400, 'videoId is required');
    }

    if(!title || !discription) {
        throw new ApiError(400, 'title and discription is required');
    }

    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, 'videoFile and thumbnail is required');
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile || !thumbnail) {
        throw new ApiError(
          500,
          'Something went wrong while uploading in cloudinary'
        );
    }
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title,
                discription,
                videoFile: videoFile.url,
                thumbnail: thumbnail.url,
                duration: videoFile.duration
            }
        },
        {
            new : true
        }
    )

    return res.status(200).json(
        new ApiResponse(200,video,"video updated successfully")
    )

})

export { publishVideo,getVideoById,updateVideo};
