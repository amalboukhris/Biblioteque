require('dotenv').config();
const mongoose= require('mongoose');
//console.log(process.env.NODE_ENV);
const express = require("express");
const app =express();

const connectDB=require("./config/db.config");

connectDB();
const PORT = process.env.PORT || 5000;

const cookieParser=require('cookie-parser');
const cors =require('cors');

app.use(cors({
    origin:'http://localhost:5000',
    credentials:true
}));
app.use(cookieParser());


app.use(express.json());


app.use("/",require('./routes/root'));
app.use("/auth",require('./routes/authRoutes'));

app.use("/users",require('./routes/userRoutes'));
app.use("/books",require('./routes/BookRoutes'));

app.get("/",(req,res)=>{
    res.send("hello");
});


mongoose.connection.once('open',()=>{
    console.log('connected the database');





app.listen(PORT, ()=>{
   console.log(`server is running on port ${PORT}`);
});
})
