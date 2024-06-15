import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            maxLength: 1000,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },{timestamps: true}
);

export const Tweet = mongoose.model('Tweet',tweetSchema);