const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['User', 'admin'] },
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    reservedBooks: {type: [mongoose.Schema.Types.ObjectId],ref: "Book",default: [], 
    },
    borrowCount: { type: Number, default: 0 },
 
    notifications: [
        {
          message: String,
          date: { type: Date, default: Date.now },
          isRead: { type: Boolean, default: false }
        }
      ]
});

module.exports = mongoose.model('User', userSchema);
