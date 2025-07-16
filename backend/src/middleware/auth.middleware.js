import jwt from "jsonwebtoken";
import User from "../models/user.model.js"
export const protectRoute=async(req,res,next)=>{
    try {
        const token = req.cookies.jwt
        // console.log(token)
        if(!token){
            return res.status(401).json({message:"Unautherized - No token provided"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"Unautherized - No token provided"})
        }
        const user=await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(400).json({message:"User not fount"})
        }
        req.user = user
        next()
    } catch (error) {
        console.log("Error in protectRoute middleware",error.message)
        res.status(500).json({message:"Internal server error"})
    }
}