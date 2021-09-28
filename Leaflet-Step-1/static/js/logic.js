// store geoJSON
let link = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// perform a GET request to the query URL
d3.json(link).then((eqdata) => {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(eqdata.features);
    console.log(eqdata.features);
});

var earthquakes = L.layerGroup();


function createMap(earthquakes) {
    // assign the different mapbox styles
    let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    let grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.light',
        accessToken: API_KEY
    });

    let outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.outdoors',
        accessToken: API_KEY
    });

    let baseMap = {
        'Satellite': satellite,
        'Grayscale': grayscale,
        'Outdoors': outdoors
    };

    let overlayMap = {
        Earthquakes: earthquakes,
        tectonicPlates: tectonicplates
    };

    let myMap = L.map('map', {
        center: [36.7126875, -120.476189],
        zoom: 4,
        layers: [outdoors, earthquakes,tectonicplates]
    });

    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(myMap);

    // function to assign colors for legend and markers
    function getColor(d) {
        return d > 5 ? '#f06b6b' :
            d > 4 ? '#f0936b' :
            d > 3 ? '#f3ba4e' :
            d > 2 ? '#f3db4c' :
            d > 1 ? '#e1f34c' :
                    '#b7f34d';
    }

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap) {
        let div = L.DomUtil.create('div', 'info legend')
        let magnitudes = [0, 1, 2, 3, 4, 5]
        let labels = []

        for (let i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
            '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i>' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }
        return div
    };
    legend.addTo(myMap);

    let tectonicLink = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
    var tectonicplates = L.layerGroup();
    // Create the faultlines and add them to the faultline layer
    d3.json(tectonicLink).then((data) =>{
        L.geoJSON(data,{
            style: {
                    opacity: 1,
                    color: "#e85151",  
                    weight: 2.7
            },
            // a popup info for each tactonic boundary
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h3> Tectonic Plate Boundary: " +feature.properties.Name+
                                    "</h3><hr><h4> PlateA: "+ feature.properties.PlateA +
                                    " &#124; PlateB: " +feature.properties.PlateB +"</h4>")
            }
        }).addTo(tectonicplates);  
    });
}


function createFeatures(eqdata) {
    function onEachFeature(feature, layer) {
        layer.bindPopup('<h4>Place: ' + feature.properties.place + '</h4><h4>Date: ' + new Date(feature.properties.time) + '</h4><h4>Magnitude: ' + feature.properties.mag + '</h4><h4>USGS Event Page: <a href=' + feature.properties.url + " target='_blank'>Click here</a></h4>", {maxWidth: 400})
    }

    let layerToMap = L.geoJSON(eqdata, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            let radius = feature.properties.mag * 4.5;

            if (feature.properties.mag > 5) {
                fillcolor = '#f06b6b';
            }
            else if (feature.properties.mag >= 4) {
                fillcolor = '#f0936b';
            }
            else if (feature.properties.mag >= 3) {
                fillcolor = '#f3ba4e';
            }
            else if (feature.properties.mag >= 2) {
                fillcolor = '#f3db4c';
            }
            else if (feature.properties.mag >= 1) {
                fillcolor = '#e1f34c';
            }
            else  fillcolor = '#b7f34d';

            return L.circleMarker(latlng, {
                radius: radius,
                color: 'black',
                fillColor: fillcolor,
                fillOpacity: 1,
                weight: 1
            });
        }
    });
    createMap(layerToMap);
}