import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VideoPlayer = () => {
  const { filename } = useParams();
  const videoRef = useRef();
  const [videoMeta, setVideoMeta] = useState(null);

  useEffect(() => {
    const fetchVideoMeta = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/videos`, {
          params: { q: filename.split('.')[0] }
        });
        const match = res.data.find(v => v.filename === filename);
        setVideoMeta(match || null);
      } catch (err) {
        console.error('Error fetching metadata', err);
      }
    };

    fetchVideoMeta();
  }, [filename]);

  const handleSeek = (time) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const streamUrl = `http://localhost:5000/api/videos/stream/${filename}`;

  return (
    <div>
      <h2>Now Playing: {videoMeta?.title || filename}</h2>
      <video ref={videoRef} width="720" controls>
        <source src={streamUrl} type="video/mp4" />
        Your browser does not support HTML video.
      </video>

      {videoMeta?.chapters?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Chapters:</h4>
          {videoMeta.chapters.map((chap, idx) => (
            <button key={idx} onClick={() => handleSeek(chap.time)} style={{ marginRight: 10 }}>
              {chap.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
