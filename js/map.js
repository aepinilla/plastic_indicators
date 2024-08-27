import { getUnitOfMeasure, create_dynamic_intervals, roundToNearestPowerOf10, capitalizeFirstWord } from './utils.js';
import { ids } from './main.js';

let dataMap;

function initializeMap(map_title, property_name, container_name) {
    if (dataMap) {
        dataMap.remove();
    }

    dataMap = L.map(container_name).setView([19.9, 80.0], 4);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(dataMap);

    const info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        if (props) {
            const unit = getUnitOfMeasure(property_name);
            let value = props[property_name];

            if (unit === '%') {
                value *= 100;
                const contents = props ? `<b>${props.name}</b><br />${value.toLocaleString('en-US')}${unit ? `${unit}` : ''}</sup>` : 'Hover over a country';
                this._div.innerHTML = `<h4>${map_title}</h4>${contents}`;
            } else {
                const contents = props ? `<b>${props.name}</b><br />${value.toLocaleString('en-US')} ${unit ? ` ${unit}` : ''}</sup>` : 'Hover over a country';
                this._div.innerHTML = `<h4>${map_title}</h4>${contents}`;
            }
        } else {
            this._div.innerHTML = `<h4>${map_title}</h4>Hover over a country`;
        }
    };

    info.addTo(dataMap);

    const features = asiaGeoData.features;
    const values = features.map(feature => feature.properties[property_name]);
    const unit = getUnitOfMeasure(property_name);

    let grades;
    if (property_name === 'marine_activities_plastic') {
        console.log('marine_activities_plastic');
    } else {
        grades = create_dynamic_intervals(values);
    }

    function getColor(d) {
        return d > grades[grades.length - 1] ? '#800026' :
            d > grades[grades.length - 2] ? '#BD0026' :
            d > grades[grades.length - 3] ? '#E31A1C' :
            d > grades[grades.length - 4] ? '#FC4E2A' :
            d > grades[grades.length - 5] ? '#FD8D3C' :
            d > grades[grades.length - 6] ? '#FEB24C' :
            d > grades[grades.length - 7] ? '#FED976' : '#FFEDA0';
    }

    const legend = L.control({ position: 'bottomright' });

    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties[property_name])
        };
    }

    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        layer.bringToFront();

        info.update(layer.feature.properties);
    }

    const geojson = L.geoJson(asiaGeoData, {
        style,
        onEachFeature
    }).addTo(dataMap);

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }

    function zoomToFeature(e) {
        dataMap.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const unit = getUnitOfMeasure(property_name);

        let displayUnit = unit;
        if (unit === '%') {
            displayUnit = 'Percentage';
        }

        const titleDiv = L.DomUtil.create('div', 'legend-title', div);
        titleDiv.innerHTML = `<strong>${displayUnit}</strong><br><br>`;

        const labels = [];
        let from, to;
        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            if (unit === '%') {
                from *= 100;
                to = to ? to * 100 : to;
            }

            labels.push(
                `<i style="background:${getColor(from + 1)}"></i> ${from.toLocaleString()} ${to ? ` &ndash; ${to.toLocaleString()}` : '+'}`
            );
        }

        const numbersDiv = L.DomUtil.create('div', 'legend-numbers', div);
        numbersDiv.innerHTML = labels.join('<br>');

        return div;
    };

    legend.addTo(dataMap);
}

// Function to initialize the leakage map with GeoJSON data
function initializeLeakageMap() {
    const mapContainer = document.getElementById('leakage_container');
    if (!mapContainer) {
        console.error('Leakage container not found');
        return;
    }
    
    // Initialize the map
    const dataMap = L.map('leakage_container').setView([0, 0], 2); // Adjust the initial view as needed

    // Load the GeoJSON data
    fetch('../data/geojson/afghanistan/Final-Rivers.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(geojsonData => {
            console.log('GeoJSON data loaded:', geojsonData); // Log the loaded data
            // Add the GeoJSON data to the map
            L.geoJSON(geojsonData).addTo(dataMap);

            // Add legend control to the map
            const legend = L.control({ position: 'bottomright' });

            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                const labels = ['<strong>Legend</strong>'];
                const categories = ['Category 1', 'Category 2', 'Category 3'];

                for (let i = 0; i < categories.length; i++) {
                    labels.push(
                        '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
                        (categories[i] ? categories[i] : '+')
                    );
                }

                const numbersDiv = L.DomUtil.create('div', 'legend-numbers', div);
                numbersDiv.innerHTML = labels.join('<br>');

                return div;
            };

            legend.addTo(dataMap);
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
}


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    ids.forEach(id => {
        if (tabName === `${id}_container`) {
            console.log(id);
            initializeMap(
                map_title = capitalizeFirstWord(id.replace(/_/g, ' ')),
                property_name = id,
                container_name = `${id}_container`
            );
        }
    });
}

export { initializeMap, initializeLeakageMap, openTab };