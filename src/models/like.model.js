import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        },
        likeBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    },{timestamps: true}
);

export const Like = mongoose.model('Like',likeSchema);