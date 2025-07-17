const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  thumbnail: String,
  tags: [String],
  duration: Number,
  resolution: String,
  chapters: [
    {
      title: String,
      time: Number 
    }
  ],
  previewClip: String,
});

module.exports = mongoose.model('Video', videoSchema);
