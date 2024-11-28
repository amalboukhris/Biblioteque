const express=require("express");
const router =express.Router();
const verifyJWT= require("../midelwares/verifyJWT");


const userController =require("../controllers/userController");

router.use(verifyJWT);
router.route("/all").get(userController.getAllUser);
router.route("/:id").get(userController.getUsersById);
router.route("/:id").put(userController.updateUser);
router.route("/:id").delete(userController.deleteUser);
router.route("/Search/:search").get(userController.searchUser);

module.exports=router;
