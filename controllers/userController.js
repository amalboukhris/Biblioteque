const User =require('../models/User');
const bcrypt = require('bcrypt');


const getAllUser =async(req,res)=>{
    const users = await User.find ().select("-password").lean();
    if(!users.length){
        return res.status(400).json({message:"No users found"});

    }
    res.json(users);

  
}

const getUsersById =async(req,res)=>{
    const {id} =req.params ;
    const users = await User.findById(id).select("-password").lean();
    if(!users){
        return res.status(400).json({message:"No users found"});

    }
    res.json(users);
}

const updateUser = async(req,res)=>{
    const {id} = req.params;
    const updates = req.body;

    if (updates.password){
        updates.password=await bcrypt.hash(updates.password,10);
    } 
    const user = await User.findByIdAndUpdate(id,updates,{new:true}).select("-password").lean();
    if(!user){
        return res.status(400).json({message:"use not found"});
    }else 
    res.json(user); 
    if(user.length===0){
        return res.status(400).json({message:"user not found"});
    }


}

const deleteUser = async(req,res)=>{
    const {id} = req.params ;
    const user =await User.findOneAndDelete(id).select("-password").lean();
    if(!user){
        return res.status(400).json({message:"use not found"});
    }else 
    res.json(user);
}
const searchUser = async(req,res)=>{
    const {search}=req.params;
    //const Search =req.body;
    if ( search.length < 3) {
        return res.status(400).json({ message: "Search query must be at least 3 characters long." });
    }
    const user = await User.find({first_name: {$regex:`^${search}`,$options: "i"  }}).select("-password").lean();

    if(!user){
        return res.status(400).json({message:"use not found"});
    }else 
    res.json(user);
  


}



module.exports={
    getAllUser, 
    getUsersById,
    updateUser,
    deleteUser,
    searchUser,
} 