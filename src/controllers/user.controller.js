import {asyncHandler} from "../utills/asyncHandler.js"
import {ApiError} from "../utills/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"


const registerUser = asyncHandler( async(req,res) => {    

    // get user deatils from frontend
    const {username, email, password, fullname } = req.body
    console.log("body: ", req.body);

    // validation - not empty

    if([fullname,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    // check if user alrady exists: username, email

    const userExists = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if(userExists){
        throw new ApiError(409, "User already exists with same email or username");
    }

    // check for image - avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    //console.log("files: ", req.files);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required");
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"avatar is required");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export {registerUser};