import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Weather.css";
import humidity_icon from "../assets/humidity.png";
import search_icon from "../assets/search.png";
import wind_icon from "../assets/wind.png";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const fallbackCities = {
  clear: ["Los Angeles", "Cairo", "Sydney", "Madrid"],
  clouds: ["London", "Berlin", "Moscow", "Tokyo"],
  rain: ["Mumbai", "Seattle", "Singapore", "Dublin"],
  snow: ["Oslo", "Reykjavik", "Zurich", "Toronto"],
  drizzle: ["Brussels", "Vancouver", "Amsterdam", "Glasgow"],
  mist: ["San Francisco", "Hong Kong", "Cape Town", "Rio de Janeiro"],
  haze: ["Delhi", "Bangkok", "Jakarta", "Lagos"],
};

const Weather = ({ setBgUrl }) => {
  const [weatherData, setWeatherData] = useState(false);
  const [usedImages, setUsedImages] = useState([]);
  const inputRef = useRef();

  // Helper to pick a random unused image from Unsplash results
  const pickUnusedImage = (results) => {
    const unused = results.filter(
      img => !usedImages.includes(img.urls.regular)
    );
    if (unused.length === 0) return null;
    const randomImg = unused[Math.floor(Math.random() * unused.length)];
    setUsedImages(prev => [...prev, randomImg.urls.regular]);
    return randomImg.urls.regular;
  };

  const fetchUnsplashImage = async (city, weather) => {
    const query = `${city} ${weather}`;
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`
      );
      if (response.data.results.length > 0) {
        const imgUrl = pickUnusedImage(response.data.results);
        if (imgUrl) {
          setBgUrl(imgUrl);
          return;
        }
      }
      // Fallback: try a random city for this weather type
      const cities = fallbackCities[weather.toLowerCase()] || [];
      if (cities.length > 0) {
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const fallbackResponse = await axios.get(
          `https://api.unsplash.com/search/photos?query=${randomCity} ${weather}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`
        );
        if (fallbackResponse.data.results.length > 0) {
          const imgUrl = pickUnusedImage(fallbackResponse.data.results);
          if (imgUrl) {
            setBgUrl(imgUrl);
            return;
          }
        }
      }
      setBgUrl(""); 
    } catch (err) {
      setBgUrl("");
      console.error("Error fetching Unsplash image:", err);
    }
  };

  const search = async (city) => {
    if (city === "") {
      alert("Please enter a city name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.main || !data.weather || !data.wind) {
        alert("City not found or API error.");
        setWeatherData(false);
        setBgUrl("");
        return;
      }
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        weatherType: data.weather[0].main.toLowerCase(),
      });
      fetchUnsplashImage(data.name, data.weather[0].main);
    } catch (error) {
      alert("Error fetching weather data. Please try again.");
      setWeatherData(false);
      setBgUrl("");
    }
  };


  return (
    <div className="weather">
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search(inputRef.current.value);
            }
          }}
        />
        <img
          src={search_icon}
          alt="Search"
          style={{
            width: "50px",
            height: "50px",
            cursor: "pointer",
            borderRadius: "50%",
            background: "#ebfffc",
            padding: "10px"
          }}
          onClick={() => search(inputRef.current.value)}
        />
      </div>
      {weatherData ? (
        <div className="weather-main">
          <img
            src={weatherData.icon}
            alt="Weather Icon"
            className="weather-icon"
          />
          <p className="temperature">{weatherData.temperature}&deg;C</p>
          <p className="location">{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="humidityIcon" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="windIcon" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Weather;