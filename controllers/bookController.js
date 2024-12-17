const Book =require('../models/Book');
const User = require('../models/User');
const schedule = require('node-schedule');
const Joi = require('joi');

const InsertBook = async (req, res) => {
  const { title, author, genre, year } = req.body;

  if (!title || !author || !genre || !year) {
    return res.status(400).json({ message: "Please provide all required fields: title, author, genre, year." });
  }


    const newBook = { title, author, genre, year };
    const book = await Book.create(newBook);

    if (!book) {
      return res.status(400).json({ message: "Book not created" });
    }

    res.status(201).json(book); 
}

const getAllBook =async(req,res)=>{
    const book = await Book.find();
    if (!book){
        return res.status(404).json({ message: "No books found" });
    }
    res.status(200).json(book);
}
const searchBook = async (req, res) => {
    const { search } = req.params;

    if (search.length < 1) {
        return res.status(400).json({ message: "Search query must be at least 1 characters long." });
    }
     const books = await Book.find({
        $or: [
            { title: { $regex: `^${search}`, $options: "i" } },  
            { author: { $regex: `^${search}`, $options: "i" } } ,
            { genre: { $regex: `^${search}`, $options: "i" } }     
        ]
    }).lean(); 

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found" });
        }


        res.status(200).json(books);


};
const updateBook = async(req,res)=>{
    const {id} = req.params;
    const updates = req.body;

   const book = await Book.findByIdAndUpdate(id, updates, { new: true
    });
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json(book);
        }
 const deleteBook = async (req, res) => {
            const { id } = req.params;
            const book = await Book.findByIdAndDelete(id);
            if (!book) {
                return res.status(404).json({ message: "Book not found " });
                }
                res.status(200).json({ message: "Book deleted" });



}

const borrowBook = async (req, res) => {
    const { userId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (book.isBorrowed) {
        return res.status(400).json({ message: "Book is already borrowed" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    
    book.isBorrowed = true;
    book.borrowedBy = user._id;
    book.borrowCount = (book.borrowCount || 0) + 1;
    await book.save();

    user.borrowedBooks.push(book._id);
    await user.save();

 
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    schedule.scheduleJob(returnDate, async () => {
        await sendNotification(userId, `Reminder: Please return the book "${book.title}" by today.`);
    });

    res.status(200).json({ message: "Book borrowed successfully", book });
};

const returnBook = async (req, res) => {
    const { userId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book does not exist" });
    }

    if (!book.isBorrowed || book.borrowedBy.toString() !== userId) {
        return res.status(400).json({ message: "Book is not borrowed by this user" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

   
    book.isBorrowed = false;
    book.borrowedBy = null;


    if (book.reservedBy) {
        const reservedUserId = book.reservedBy.toString();
        await sendNotification(reservedUserId, `The book "${book.title}" is now available for you to borrow.`);
        book.reservedBy = null; 
    }

    await book.save();

    user.borrowedBooks = user.borrowedBooks.filter(
        (id) => id.toString() !== bookId
    );
    await user.save();

    res.status(200).json({ message: "Book returned successfully", book });
};




const getBorrowedBooks = async (req, res) => {
    try {
       
        const borrowedBooks = await Book.find({ isBorrowed: true })
            .populate('borrowedBy', 'first_name last_name email') 
            .lean();

      
        if (!borrowedBooks || borrowedBooks.length === 0) {
            return res.status(404).json({ message: "No borrowed books found" });
        }

        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error('Error in getBorrowedBooks:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMostBorrowedBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ borrowCount: -1 }).limit(10);
        if (!books.length) {
            return res.status(404).json({ message: "No borrowed books found" });
        }
        res.status(200).json(books);
    } catch (error) {
        console.error("Error in getMostBorrowedBooks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const reserveBook = async (req, res) => {
    try {
        const { userId, bookId } = req.body;

   
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        
        if (!book.isBorrowed) {
            return res.status(400).json({ message: "Book is not borrowed, reservation is not allowed" });
        }

        if (book.reservedBy) {
            return res.status(400).json({ message: "Book is already reserved" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!Array.isArray(user.reservedBooks)) {
            user.reservedBooks = []; 
        }

        
        book.reservedBy = user._id;
        await book.save();

        user.reservedBooks.push(book._id);
        await user.save();

        res.status(200).json({
            message: "Book reserved successfully",
            book,
        });
    } catch (error) {
        console.error("Erreur dans reserveBook:", error);
        res.status(500).json({ message: "An error occurred while reserving the book" });
    }
};


const getReservedBooks = async (req, res) => {
    try {
       
        const reservedBooks = await Book.find({ reservedBy: { $ne: null } }).populate("reservedBy", "name email"); // Optionnel : Populate pour inclure les infos de l'utilisateur

        res.status(200).json({
            message: "Reserved books retrieved successfully",
            reservedBooks,
        });
    } catch (error) {
        console.error("Erreur dans getReservedBooks:", error);
        res.status(500).json({ message: "An error occurred while retrieving reserved books" });
    }
};
const sendNotification = async (userId, message) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }

        user.notifications.push({ message });
        await user.save();
    } catch (error) {
        console.error("Erreur dans sendNotification:", error);
    }
};




const leaveReview = async (req, res) => {
  const { bookId } = req.params;
  console.log('Received bookId:', bookId);
  const { userId, rating, comment } = req.body;

  const reviewSchema = Joi.object({
    userId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow("").optional(),
  });

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
   
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    
    const existingReview = book.reviews.find(
      (review) => review.userId.toString() === userId
    );
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "User has already left a review for this book." });
    }

 
    const newReview = { userId, rating, comment };
    book.reviews.push(newReview);

   
    await book.save();

    res.status(201).json({ message: "Review added successfully", reviews: book.reviews });
  } catch (error) {
    console.error("Error in leaveReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getBookReviews = async (req, res) => {
    const { bookId } = req.params;
  
    try {
      const book = await Book.findById(bookId);
  
      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }
  
      res.status(200).json({ reviews: book.reviews });
    } catch (error) {
      console.error("Error in getBookReviews:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
  

  const getBookRating = async (req, res) => {
    const { bookId } = req.params;

   
    if (!bookId || bookId.length !== 24) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        const totalReviews = book.reviews.length;

        if (totalReviews === 0) {
            return res.status(200).json({ averageRating: 0, totalReviews });
        }

        const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(2); 

        res.status(200).json({ averageRating, totalReviews });
    } catch (error) {
        console.error("Error in getBookRating:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  



       







module.exports = {
     InsertBook ,
    getAllBook,
    searchBook ,
    updateBook,
    deleteBook,

    borrowBook,
    returnBook,
    getBorrowedBooks,
    reserveBook,
    getReservedBooks,
    leaveReview,
    getBookReviews,
    getBookRating,
    
    getMostBorrowedBooks
    };


    
