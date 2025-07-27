import React, { useState, useEffect } from 'react'
import Weather from './components/Weather'
import axios from 'axios'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const App = () => {
  const [bgUrl, setBgUrl] = useState("");

  // Fetch a random image on mount
  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`
        );
        setBgUrl(response.data.urls.regular);
      } catch (err) {
        setBgUrl(""); // fallback to gradient if error
      }
    };
    fetchRandomImage();
  }, []);

  return (
    <div className='app'>
      <div
        className="weather-bg"
        style={{
          backgroundImage: bgUrl
            ? `url(${bgUrl})`
            : "linear-gradient(45deg, #2f4680, #500ae4)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s",
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          inset: 0,
          zIndex: -1,
        }}
      />
      <Weather setBgUrl={setBgUrl} />
    </div>
  )
}

export default App