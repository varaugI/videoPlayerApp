
import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = () => {
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !title) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('video', videoFile);

    try {
      const res = await axios.post('http://localhost:5000/api/videos/upload', formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default VideoUpload;
