import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom bus icon
const busIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const MapComponent = ({ center, buses, route, tripStartTime, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Helper to format time
  const formatTime = (isoString, offsetMins) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      routeLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
  }, []);

  // 2. Update Map Center
  /*
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], mapInstanceRef.current.getZoom());
    }
  }, [center]);
  */

  // 3. Update Route Line & Stops
  useEffect(() => {
    if (mapInstanceRef.current && routeLayerRef.current) {
      routeLayerRef.current.clearLayers();

      if (route && route.length > 0) {
        // Draw Stop Markers
        route.forEach((stop, index) => {
          let popupContent = `<div class="font-semibold">${stop.name}</div>`;

          if (tripStartTime && (stop.arrival_offset_mins !== undefined || stop.offset !== undefined)) {
            const offset = stop.arrival_offset_mins !== undefined ? stop.arrival_offset_mins : (index * 15);
            const time = formatTime(tripStartTime, offset);
            popupContent += `<div class="text-xs text-gray-600">Est: ${time}</div>`;
          }

          L.circleMarker([stop.lat, stop.lng], {
            radius: 6,
            fillColor: "#fff",
            color: "#3B82F6",
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          })
            .bindPopup(popupContent)
            .addTo(routeLayerRef.current);
        });

        // FETCH REAL ROAD GEOMETRY FROM OSRM
        const fetchRoute = async () => {
          try {
            // OSRM requires "lng,lat" separated by semicolons
            const coordinates = route.map(stop => `${stop.lng},${stop.lat}`).join(';');
            const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              const routeGeoJSON = data.routes[0].geometry;

              // Draw the snapped route
              const polyline = L.geoJSON(routeGeoJSON, {
                style: {
                  color: '#3B82F6',
                  weight: 5,
                  opacity: 0.8,
                  lineJoin: 'round'
                }
              }).addTo(routeLayerRef.current);

              // Fit bounds
              const bounds = polyline.getBounds();
              if (bounds.isValid()) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
              }

            } else {
              throw new Error("OSRM No Route");
            }
          } catch (err) {
            console.warn("OSRM Route Fetch Failed, falling back to straight line:", err);
            // Fallback: Straight Line
            const latlngs = route.map(stop => [stop.lat, stop.lng]);
            const polyline = L.polyline(latlngs, { color: '#3B82F6', weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(routeLayerRef.current);

            const bounds = polyline.getBounds();
            if (bounds.isValid()) {
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        };

        fetchRoute();
      }
    }
  }, [route, tripStartTime]);

  // 4. Update Bus Markers
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      if (buses && buses.length > 0) {
        buses.forEach(bus => {
          if (bus.location && bus.location.lat && bus.location.lng) {
            const marker = L.marker([bus.location.lat, bus.location.lng], { icon: busIcon })
              .addTo(markersLayerRef.current);

            const popupContent = `
                    <div class="text-center">
                        <h3 class="font-bold text-sm">${bus.busNumber}</h3>
                        ${bus.speed ? `<p class="text-xs">Speed: ${Math.round(bus.speed)} km/h</p>` : ''}
                    </div>
                `;
            marker.bindPopup(popupContent);
          }
        });
      }
    }
  }, [buses]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-200 shadow-sm ${className}`} style={{ height: '400px', zIndex: 0 }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default MapComponent;
