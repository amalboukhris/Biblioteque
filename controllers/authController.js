//const { model } = require('mongoose');
const User =require('../models/User');
const bcrypt =require('bcrypt');
//const { request } = require('express');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
  
    // Validation des champs requis
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Vérifier si l'utilisateur existe déjà
      const duplicatedEmail = await User.findOne({ email }).exec();
      if (duplicatedEmail) {
        return res.status(409).json({ message: "User already exists" });
      }
  
      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Création de l'utilisateur
      await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
  
      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
  const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const foundUser = await User.findOne({ email }).exec();
  
      if (!foundUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, foundUser.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Génération du token JWT
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
  
      res.status(200).json({
        accessToken,
        id: foundUser._id,
        email: foundUser.email,
        message: "Login successful",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  

module.exports={
    register,login,
}               