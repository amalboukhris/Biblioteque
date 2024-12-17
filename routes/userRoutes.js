const express=require("express");
const router =express.Router();
const verifyJWT= require("../midelwares/verifyJWT");
const verifyRole = require("../midelwares/verifyRole");
const bookController = require('../controllers/bookController');
const userController =require("../controllers/userController");

router.use(verifyJWT);
router.route("/all").get(verifyRole("admin"),userController.getAllUser);
router.route("/:id").get(verifyRole("admin"),userController.getUsersById);
router.route("/:id").put(verifyRole("admin"),userController.updateUser);
router.route("/:id").delete(verifyRole("admin"),userController.deleteUser);
router.route("/Search/:search").get(verifyRole("admin"),userController.searchUser);
router.route("/").post(verifyJWT, verifyRole("admin"),bookController.InsertBook);
module.exports=router;
