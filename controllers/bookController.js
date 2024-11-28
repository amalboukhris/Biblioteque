const Book =require('../models/Book');
const User = require('../models/User');

const InsertBook = async (req, res) => {
  const { title, author, genre, year } = req.body;

  // Vérifier que toutes les données nécessaires sont présentes
  if (!title || !author || !genre || !year) {
    return res.status(400).json({ message: "Please provide all required fields: title, author, genre, year." });
  }


    const newBook = { title, author, genre, year };
    const book = await Book.create(newBook);

    if (!book) {
      return res.status(400).json({ message: "Book not created" });
    }

    res.status(201).json(book); // Réponse avec le livre créé et code HTTP 201
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
        await book.save();

        user.borrowedBooks.push(book._id);
        await user.save();

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

        // Mettez à jour le statut du livre
        book.isBorrowed = false;
        book.borrowedBy = null;
        await book.save();

        // Supprimez le livre de la liste des emprunts de l'utilisateur
        user.borrowedBooks = user.borrowedBooks.filter(
            (id) => id.toString() !== bookId
        );
        await user.save();

        res.status(200).json({ message: "Book returned successfully", book });

};
const getBorrowedBooks = async (req, res) => {
    try {
        // Cherche les livres empruntés
        const borrowedBooks = await Book.find({ isBorrowed: true })
            .populate('borrowedBy', 'first_name last_name email') // Inclut les infos sur l'utilisateur
            .lean();

        // Vérifie si aucun livre emprunté n'a été trouvé
        if (!borrowedBooks || borrowedBooks.length === 0) {
            return res.status(404).json({ message: "No borrowed books found" });
        }

        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error('Error in getBorrowedBooks:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const reserveBook = async (req, res) => {
    const { userId, bookId } = req.body;

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Vérifier si le livre est déjà emprunté ou réservé
    if (book.isBorrowed) {
        return res.status(400).json({ message: "Book is already borrowed" });
    }
    if (book.reservedBy) {
        return res.status(400).json({ message: "Book is already reserved" });
    }

    // Trouver l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Marquer le livre comme réservé
    book.reservedBy = user._id;
    await book.save();

    // Ajouter ce livre à la liste des livres réservés de l'utilisateur (facultatif)
    user.reservedBooks.push(book._id);
    await user.save();

    res.status(200).json({ message: "Book reserved successfully", book });
};




       







module.exports = { InsertBook ,
    getAllBook,
    searchBook ,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    getBorrowedBooks,
    reserveBook
    };


    
