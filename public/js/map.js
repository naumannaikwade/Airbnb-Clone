maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: listing.geometry.coordinates,
  zoom: 11,
});

new maptilersdk.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates) // [lng, lat]
  .setPopup(
    new maptilersdk.Popup().setHTML(`
      <div>
        <h5>${listing.title}</h5>
        <p><i>Exact location shown after booking</i></p>
      </div>
    `)
  )
  .addTo(map);
