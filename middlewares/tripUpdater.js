export function buildItineraryFromPlaces(places = []) {
  const grouped = {};

  places.forEach((place) => {
    if (!place.date) return;

    const day = new Date(place.date).toISOString().split("T")[0]; // YYYY-MM-DD
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(place);
  });

  return Object.keys(grouped).map((day) => ({
    date: new Date(day),
    places: grouped[day],
  }));
}
