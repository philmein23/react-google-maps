import React, { Component, Fragment } from 'react';

function promisfy(fn, options) {
  return new Promise((resolve, reject) => {
    fn(options, (results, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}

const OPTIONS = {
  FIELDS: [
    'photos',
    'formatted_address',
    'name',
    'rating',
    'opening_hours',
    'geometry'
  ]
};

class Map extends Component {
  state = {
    query: '',
    loading: false,
    results: []
  };

  placesService = null;
  map = null;
  markers = [];

  async componentDidMount() {
    this.setState(() => ({
      loading: true
    }));

    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    }).then(() => {
      this.setState(() => ({ loading: false }));
      this.initMap();
    });
  }

  onHandleQueryChange = e => {
    let { value } = e.target;
    this.setState({
      query: value
    });
  };

  initMap = ({ lat = -35, lng = 150 } = {}) => {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat, lng },
      zoom: 10
    });

    this.initPlaceService(this.map);
  };

  initPlaceService = map => {
    this.placesService = new google.maps.places.PlacesService(map);
  };

  addMarker = (map, { lat, lng }) => {
    let marker = new google.maps.Marker({
      position: { lat, lng },
      map: map
    });

    this.markers.push(marker);
  };

  setAllMarkers = () => {
    if (this.markers.length) {
      this.markers.forEach(marker => marker.setMap(this.map));
    }
  };

  search = async e => {
    e.preventDefault();

    const results = await this.searchLocations({ query: this.state.query });

    this.setState({ results });

    results.forEach(place => {
      const { lat, lng } = place.geometry.location;

      this.initMap({ lat: lat(), lng: lng() });
      this.addMarker(this.map, { lat: lat(), lng: lng() });
      this.setAllMarkers();
    });

    console.log(results);
  };

  searchLocations = options => {
    return new Promise((resolve, reject) => {
      this.placesService.textSearch(options, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  };

  gotoLocatonOnMap = place => {
    const { lat, lng } = place.geometry.location;

    this.initMap({ lat: lat(), lng: lng() });
  };

  findDetails = options => {
    return new Promise((resolve, reject) => {
      this.placesService.findPlaceFromQuery(options, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  };

  renderLocations = () => {
    return (
      <div>
        {this.state.results.length > 0 &&
          this.state.results.map(place => (
            <ul>
              <li>
                <a
                  href="javascript:;"
                  onClick={() => this.gotoLocatonOnMap(place)}
                >
                  {place.name}
                </a>
                {place.formatted_address}
              </li>
            </ul>
          ))}
      </div>
    );
  };

  render() {
    return (
      <div className="container">
        {this.state.loading ? (
          <div>Loading...</div>
        ) : (
          <Fragment>
            <input
              type="text"
              placeholder="Search Places..."
              onChange={this.onHandleQueryChange}
            />
            <button className="search" onClick={this.search}>
              Search
            </button>
            <div id="map" />
            {this.renderLocations()}
          </Fragment>
        )}
      </div>
    );
  }
}

export default Map;
