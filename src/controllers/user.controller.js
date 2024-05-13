import {asyncHandler} from "../utills/asyncHandler.js"

const registerUser = asyncHandler( async(req,res) => {
    res.status(200).json({
        massage: "chai aur code"
    })
})

export {registerUser};