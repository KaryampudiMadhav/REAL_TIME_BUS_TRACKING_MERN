import axios from "axios";

// This is a generic, reusable function that we will not export.
async function getNearestAmenity(amenity, latitude, longitude) {
  // Overpass QL query for the specified amenity within a 5km radius
  const query = `[out:json];node[amenity=${amenity}](around:5000,${latitude},${longitude});out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(url);
    const places = response.data.elements;

    if (places.length > 0) {
      // The first result from the 'around' filter is generally the closest
      const place = places[0];
      return {
        name:
          place.tags.name ||
          `Unknown ${amenity.charAt(0).toUpperCase() + amenity.slice(1)}`,
        address: place.tags.address || "Address not available",
        location: { lat: place.lat, lon: place.lon },
      };
    }
    // Return null if no places are found
    return null;
  } catch (err) {
    console.error(`Error fetching nearest ${amenity} from OSM:`, err);
    return null;
  }
}

// --- EXPORTED FUNCTIONS ---

// This function now uses our reusable helper to find a hospital
export async function getNearestHospital(latitude, longitude) {
  return await getNearestAmenity("hospital", latitude, longitude);
}

// This is the new function that uses the same helper to find a police station
export async function getNearestPoliceStation(latitude, longitude) {
  return await getNearestAmenity("police", latitude, longitude);
}
