import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import VanillaTilt from './vanilla-tilt.js';
import PrecipitationMap from './components/PrecipitationMap.jsx'; 


function App() {
  // State variables to store the location input, weather data, and state information
  const [location, setLocation] = useState('');
  const [data, setData] = useState({});
  const [state, setState] = useState('');
  const inputRef = useRef(null); // Reference to the input element
  const weatherInfoRef = useRef(null); // Reference to the weather-info-wrapper element

  // useEffect hook to load the Google Maps API script and set up autocomplete
  useEffect(() => {
    // Function to load a script and call a callback when it's loaded
    const loadScript = (url, callback) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.head.appendChild(script); // Add the script to the document
    };

    // Function to set up Google Places Autocomplete on the input element
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        // Set up autocomplete on the input element
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'], // Restrict autocomplete to cities
        });

        // Listen for changes when a place is selected
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            fetchWeatherData(lat, lng); // Fetch weather data for the selected place
          }
        });
      } else {
        console.error('Google Maps API script not loaded');
      }
    };

    // Load the Google Maps API script if not already loaded
    if (!window.google) {
      loadScript(`https://maps.googleapis.com/maps/api/js?key=AIzaSyCAOCm-I7xhWBi57uFWl3JXiDNmjSuda8o`, initAutocomplete);
    } else {
      initAutocomplete();
    }
  }, []);

  // useEffect hook to initialize VanillaTilt
  useEffect(() => {
    if (weatherInfoRef.current) {
      VanillaTilt.init(weatherInfoRef.current, {
        max: 1.5,
        speed: 100,
        glare: true,
        "max-glare": .15,
        "glare-prerender": false
      });
    }
  }, []);

  // useEffect hook to reset the placeholder text when location state changes
  useEffect(() => {
    if (location === '') {
      inputRef.current.placeholder = 'Enter Location...';
    }
  }, [location]);

  // FETCHING !!WEATHER DATA!! BY LATITUDE AND LONGITUDE
  const fetchWeatherData = (lat, lng) => {
    // Fetch weather data from OpenWeatherMap API using the latitude and longitude
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=ee97a34ea95c2af03e9c9923cf37c23e`)
      .then(response => response.json())
      .then(data => {
        setData(data); // Update the weather data state
        // Fetch state information using Google Maps Geocoding API
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCAOCm-I7xhWBi57uFWl3JXiDNmjSuda8o`)
          .then(response => response.json())
          .then(geoData => {
            if (geoData.results && geoData.results[0]) {
              const addressComponents = geoData.results[0].address_components;
              const stateInfo = addressComponents.find(component => component.types.includes('administrative_area_level_1'));
              setState(stateInfo ? stateInfo.long_name : ''); // Update the state information
            } else {
              setState('');
            }
          })
          .catch(error => {
            console.error('Error fetching state information:', error);
            setState('');
          });
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setData({});
        setState('');
      });
  };

  // FETCHING!! WEATHER DATA BY NAME!! BY LONGITUDE AND LATITUDE
  const fetchWeatherDataByName = (place) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=ee97a34ea95c2af03e9c9923cf37c23e`)
      .then(response => response.json())
      .then(data => {
        setData(data); // Update the weather data state
        // Fetch state information using Google Maps Geocoding API
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.coord.lat},${data.coord.lon}&key=AIzaSyCAOCm-I7xhWBi57uFWl3JXiDNmjSuda8o`)
          .then(response => response.json())
          .then(geoData => {
            if (geoData.results && geoData.results[0]) {
              const addressComponents = geoData.results[0].address_components;
              const stateInfo = addressComponents.find(component => component.types.includes('administrative_area_level_1'));
              setState(stateInfo ? stateInfo.long_name : ''); // Update the state information
            } else {
              setState('');
            }
          })
          .catch(error => {
            console.error('Error fetching state information:', error);
            setState('');
          });

      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setData({});
        setState('');
      });
  }; 

  // Function to handle the Enter key press event
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchWeatherDataByName(location); // Fetch weather data for the entered location
      setLocation(''); // Clear the input field
      inputRef.current.placeholder = 'Enter Location...'; // Reset the placeholder text
      inputRef.current.blur();      
    }
  };


  // Function to get the weather icon class based on the weather condition
  const getWeatherIconClass = (weather) => {
    if (!weather || weather.length === 0) return '';

    const condition = weather[0].main.toLowerCase();
    switch (condition) {
      case 'clear':
        return 'wi wi-day-sunny';
      case 'rain':
        return 'wi wi-rain';
      case 'clouds':
        return 'wi wi-cloudy';
      case 'snow':
        return 'wi wi-snow';
      case 'wind':
        return 'wi wi-strong-wind';
      case 'storm':
        return 'wi wi-thunderstorm';
      default:
        return 'wi wi-na';
    }
  };

  // Function to get the weather condition description based on the weather condition
  const getWeatherConditions = (weather) => {
    if (!weather || weather.length === 0) return '';

    const condition = weather[0].main.toLowerCase();
    switch (condition) {
      case 'clear':
        return 'Clear';
      case 'rain':
        return 'Rainy';
      case 'clouds':
        return 'Cloudy';
      case 'snow':
        return 'Snowy';
      case 'wind':
        return 'Windy';
      case 'storm':
        return 'Stormy';
      default:
        return 'Chilly';
    }
  };

  return (
    <div className="App">
      <div className='weather-info-wrapper tilt-element' ref={weatherInfoRef}>
        <header className='top-section'>
          <div className='temp-icon-container'>
            <div className='temp-container'>
              {data.main ? (
                <div>
                  <h1 className='temp-number'>{Math.round((data.main.temp - 273.15) * 9/5 + 32)}°F</h1> {/* Convert from Kelvin to Fahrenheit */}
                </div>
              ) : (
                <h1>64°F</h1>
              )}
            </div>
            <div className='weather-icon'>
              {data.weather ? (
                <i className={`weather-icon-size ${getWeatherIconClass(data.weather)}`}></i>
              ) : (
                <h1>-</h1>
              )}
            </div>
          </div>

          {/* Location */}
          <div className='location-container'>
            <h1 className='location'>
              {data.name && state ? `${data.name}, ${state}` : 'Your Location'}
            </h1>
          </div>

          {/* Weather Conditions */}
          <div className='weather-conditions-container'>
            {data.weather ? getWeatherConditions(data.weather) : 'Weather Conditions'}
          </div>

          {/* High-Low 
          <div className='high-low-data'>
            <div className='high'> hi: {data.main ? Math.round((data.main.temp_max - 273.15) * 9/5 + 32) + '°F' : 'N/A'} </div>
            <div className='low'> lo: {data.main ? Math.round((data.main.temp_min - 273.15) * 9/5 + 32) + '°F' : 'N/A'} </div>
          </div>
          */}

        </header>

        <main className='cards-container'>
          <div className='left-card'>
            <div className='card-header'>
              <i className="fas fa-thermometer-half"></i>
              <p>Feels Like</p>
            </div>

            <div>
              {data.uvIndex !== undefined ? data.uvIndex : 'N/A'}
            </div>
          </div>

          <div className='middle-card'>
            <div className='card-header'>
              <i className="wi wi-strong-wind"></i>
              <p>Air Quality</p>
            </div>

            <div>
              {data.airQuality !== undefined ? data.airQuality : 'N/A'}
            </div>
          </div>

          <div className='right-card'>
            <div className='card-header'>
              <i className="fas fa-cloud-rain"></i>
              <p>Precipitation Map</p>
            </div>

            <div style={{ height: '200px' }}>
              {data.location ? (
                <PrecipitationMap lat={data.location.lat} lon={data.location.lon} />
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='input-wrapper'>
          <input 
            ref={inputRef}
            value={location} 
            onChange={event => setLocation(event.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder='Enter Location...' 
            type='text' 
            className='input-box'
          />

        </footer>
      </div>

    </div>
  );
}

export default App;