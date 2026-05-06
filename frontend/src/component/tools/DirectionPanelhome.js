import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SearchInput from "./searchcontols";

export default function DirectionPanel({ setStart, setEnd, start, end }) { // ← recevoir start et end
  const handleStartSelect = (place) => {
    setStart([parseFloat(place.lat), parseFloat(place.lon)]);
  };

  const handleDestinationSelect = (place) => {
    setEnd([parseFloat(place.lat), parseFloat(place.lon)]);
  };

  return (
    <div
      className="card p-3"
      style={{
        width: "300px",
        borderRadius: "15px",
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1000,
      }}
    >
      <div className="d-flex align-items-center mb-3">
        <h5 className="mx-auto">Guidiny</h5>
      </div>

      <div className="p-1 bg-light">
        <span className="input-group mb-3 justify-content-between">
          <i className="bi bi-geo-alt fs-5" />
          <SearchInput
            placeholder="Choose starting point"
            onSelect={handleStartSelect}
            className="form-control"
          />
        </span>

        <span className="input-group mb-3 justify-content-between">
          <i className="bi bi-geo fs-5" />
          <SearchInput
            placeholder="Choose destination"
            onSelect={handleDestinationSelect}
            className="form-control"
          />
        </span>

        <button
          className="btn btn-info w-100"
          onClick={() => {
            if (!start || !end) {
              alert("Please select both start and destination points");
              return;
            }
            // Ici tu peux ajouter la logique pour lancer le routing ou autre
            console.log("Routing from", start, "to", end);
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
