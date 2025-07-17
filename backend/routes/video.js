const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Video = require('../models/Video');
const ffmpeg = require('fluent-ffmpeg');
const router = express.Router();

// Setup Multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });


// POST: Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title } = req.body;
    const filePath = req.file?.path;
    const fileName = req.file?.filename;

    if (!filePath || !fileName) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const previewName = `preview-${fileName}`;
    const previewPath = path.join(uploadDir, previewName);
    const thumbName = `thumb-${fileName}.jpg`;
    const thumbPath = path.join(uploadDir, thumbName);

    // Step 1: Extract metadata
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
              return res.status(500).json({ error: 'Failed to analyze video' });
      }

      const duration = metadata.format.duration;
      const resolution = `${metadata.streams[0].width}x${metadata.streams[0].height}`;

    
      ffmpeg(filePath)
        .setStartTime('00:00:02')
        .duration(5)
        .output(previewPath)
        .on('end', () => {
          
          ffmpeg(filePath)
            .screenshots({
              timestamps: ['5%'],
              filename: thumbName,
              folder: uploadDir,
              size: '320x240'
            })
            .on('end', async () => {
              try {
                const video = new Video({
                  title,
                  filename: fileName,
                  previewClip: previewName,
                  thumbnail: thumbName,
                  duration,
                  resolution,
                  tags: [],
                  description: ''
                });
                await video.save();
                res.status(201).json({ message: 'Video uploaded successfully' });
              } catch (dbErr) {
             
                res.status(500).json({ error: 'Database error' });
              }
            })
            .on('error', err => {
              
              res.status(500).json({ error: 'Thumbnail generation failed' });
            });
        })
        .on('error', err => { 
          res.status(500).json({ error: 'Preview generation failed' });
        })
        .run();
    });
  } catch (err) {
   
    res.status(500).json({ error: 'Server error' });
  }
});


// List videos
router.get('/', async (req, res) => {
  const { q, tag } = req.query;

  const query = {};
  if (q) query.title = { $regex: q, $options: 'i' };
  if (tag) query.tags = tag;

  const videos = await Video.find(query);
  res.json(videos);
});

// Stream video
router.get('/stream/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router;
