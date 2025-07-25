import cloudinary from "../lib/cloudinary.js"
import { getRecieverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUserForSlidebar = async (req,res) => {
    try {
        const loggedInUserId=req.user._id
        const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password")
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUserForSlidebar",error.message)
        res.status(500).json({error:"Internal server error"})
    }
}

export const getMessages = async (req,res) => {
    try {
        const {id:userToChatId} = req.params
        const myId = req.user._id
        const messages = await Message.find({
            $or:[
                {senderId:myId,recieverId:userToChatId},
                {senderId:userToChatId,recieverId:myId}
            ]
        })
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller")
        res.status(500).json({error:"Internal server error"})
    }
}

export const sendMessage = async(req,res)=>{
    try {
        const{text,image} = req.body
        const senderId=req.user._id
        const {id:recieverId}=req.params
        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image)
            imageUrl=uploadResponse.secure_url
        }
        const newMessage=new Message({
            senderId,
            recieverId,
            text,
            image:imageUrl
        })
        await newMessage.save()

        const revcieverSocketId = getRecieverSocketId(recieverId);
        if(revcieverSocketId){
            io.to(revcieverSocketId).emit("newMessage", newMessage)
        }

        res.status(200).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller")
        res.status(500).json({error:"Internal server error"})
    }
}