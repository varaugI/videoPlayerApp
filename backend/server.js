const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const videoRoutes = require('./routes/video');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/videoApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/videos', videoRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
