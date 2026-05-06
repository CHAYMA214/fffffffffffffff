import React, { useState, useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet-control-geocoder";

const SearchInput = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 3) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            value
          )}&format=json&limit=5`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setResults([]);
    onSelect(place);
  };

  return (
    <div className="mb-3 position-relative">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {results.length > 0 && (
        <div
          className="list-group position-absolute w-100"
          style={{ zIndex: 1050 }}
        >
          {results.map((place) => (
            <button
              key={place.place_id}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LeafletGeocoder = () => {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const latlng = e.geocode.center;
        L.marker(latlng)
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.fitBounds(e.geocode.bbox);
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
};

export default SearchInput;
