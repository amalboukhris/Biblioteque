const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '', optional: true }
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  isBorrowed: { type: Boolean, default: false },
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviews: [reviewSchema], 
});

module.exports = mongoose.model('Book', bookSchema);
