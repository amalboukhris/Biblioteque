const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    year: { type: Number, required: true },
    isBorrowed: { type: Boolean, default: false },
    borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Référence au modèle User
});

module.exports = mongoose.model('Book', bookSchema);
