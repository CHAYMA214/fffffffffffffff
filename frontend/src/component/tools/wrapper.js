import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", // icône en ligne
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const LeafletRoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routing = L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      lineOptions: { styles: [{ color: "blue", weight: 4, opacity: 0.7 }] },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: true,
      createMarker: (i, wp) => {
        return L.marker(wp.latLng, { icon: DefaultIcon });
      },
    }).addTo(map);

    return () => map.removeControl(routing);
  }, [start, end, map]);

  return null;
};

export default LeafletRoutingMachine;
