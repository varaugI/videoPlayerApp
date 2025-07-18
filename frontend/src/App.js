
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import VideoGallery from './components/VideoGallery';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import './styles.css';

function App() {
  return (
    <div>
      <nav>
        <div><strong>VideoApp</strong></div>
        <div>
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<VideoGallery />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/watch/:filename" element={<VideoPlayer />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
