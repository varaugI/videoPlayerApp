
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/videos', {
        params: { q: searchQuery, tag: selectedTag }
      });
      setVideos(res.data);

      // Extract unique tags
      const tagsSet = new Set();
      res.data.forEach(video => {
        (video.tags || []).forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet));
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedTag]);

  return (
    <div>
      <h2>Video Gallery</h2>
      <Link to="/upload">Upload New Video</Link>

      {/* Search and Filter */}
      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {videos.map(video => (
          <div key={video._id} style={{ border: '1px solid #ccc', margin: 10, padding: 10, width: 280 }}>
            <h3>{video.title}</h3>
            <video
              src={`http://localhost:5000/uploads/${video.previewClip}`}
              width="260"
              height="150"
              muted
              loop
              autoPlay
              style={{ display: 'block', marginBottom: 8 }}
            />
            <img
              src={`http://localhost:5000/uploads/${video.thumbnail}`}
              alt="Thumbnail"
              width="260"
              height="150"
              style={{ objectFit: 'cover' }}
            />
            <p>Duration: {Math.round(video.duration)}s</p>
            <p>Resolution: {video.resolution}</p>
            <Link to={`/watch/${video.filename}`}>▶ Watch</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
