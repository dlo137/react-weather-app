import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PrecipitationMap = ({ lat, lon }) => {
  const apiKey = 'ee97a34ea95c2af03e9c9923cf37c23e'; // Replace with your OpenWeatherMap API key
  const layer = 'precipitation_new';

  return (
    <MapContainer center={[lat, lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`}
      />
    </MapContainer>
  );
};

export default PrecipitationMap;