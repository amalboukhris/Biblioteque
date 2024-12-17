const express= require('express');
const verifyRole = require('../midelwares/verifyRole');
const router =express.Router();



router.get("/admin",verifyRole(['admin']),(req,res)=>{
    res.send('hello');
});
module.exports=router;