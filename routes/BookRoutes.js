const express=require("express");
const router =express.Router();
const bookController = require('../controllers/bookController');
const verifyJWT = require("../midelwares/verifyJWT");
const verifyRole = require("../midelwares/verifyRole");

router.route("/").post(verifyJWT, verifyRole("admin"),bookController.InsertBook);
router.route("/All").get(bookController.getAllBook);
router.route("/search/:search").get(bookController.searchBook);
router.route("/:id").put(bookController.updateBook);
router.route("/:id").delete(bookController.deleteBook);
router.route("/borrow").post(bookController.borrowBook);
router.route("/return").post(bookController.returnBook);
router.route("/borrow/all").get(bookController.getBorrowedBooks);
router.route("/reserve").post(bookController.reserveBook);
router.route("/reserve/all").get(bookController.getReservedBooks);
router.route("/reviews/:bookId").post (bookController.leaveReview); 
router.route("/reviews/:bookId").get(bookController.getBookReviews); 
router.route("/rating/:bookId").get(bookController.getBookRating); 
router.route("/mostborrowed").get(bookController.getMostBorrowedBooks);

module.exports=router;