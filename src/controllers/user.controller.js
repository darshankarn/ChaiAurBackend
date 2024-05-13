import {asyncHandler} from "../utills/asyncHandler.js"
import {ApiError} from "../utills/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"


const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validationBeforSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler( async(req,res) => {    

    // get user deatils from frontend
    const {username, email, password, fullname } = req.body
    //console.log("body: ", req.body);

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

const loginUser = asyncHandler( async (req,res) => {
    
    // get email or username and password from user
    const {email,username,password} = req.body;

    if(!username || !email){
        throw new ApiError(400,"username or email is required");
    }

    // check if user is exists
    const user = await User.findOne({
        $or: [
            {email},{username}
        ]
    })

    if(!user){
        throw new ApiError(404,"User is not registered")
    }
    // check password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }
    // generate acess token
    // generate refresh token
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    // send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },"User is logged in")
    )
})

const logoutUser = asyncHandler( async(req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out")
    )

})

export {registerUser, loginUser, logoutUser};