const express=require("express");
const router =express.Router();
const bookController = require('../controllers/bookController');
router.route("/").post(bookController.InsertBook);
router.route("/All").get(bookController.getAllBook);
router.route("/search/:search").get(bookController.searchBook);
router.route("/:id").put(bookController.updateBook);
router.route("/:id").delete(bookController.deleteBook);
router.route("/borrow").post(bookController.borrowBook);
router.route("/return").post(bookController.returnBook);
router.route("/borrow/all").get(bookController.getBorrowedBooks);
router.route("/reserve").post(bookController.reserveBook);



module.exports=router;