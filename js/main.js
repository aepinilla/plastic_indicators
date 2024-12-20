let dataMap;
const container = document.getElementById('parent-container');

function generatePopupContent(props) {
    if (props) {
        const unit = getUnitOfMeasure(property_name);
        let value = props[property_name];

        // Handle cases where the value is "NA"
        if (value === "NA") {
            return `<b>${props.name}</b><br />No data available`;
        }

        // Multiply the value by 100 if the unit is '%'
        if (unit === '%') {
            value *= 100;
            return props ? `<b>${props.name}</b><br />${value.toLocaleString('en-US')}${unit ? `${unit}` : ''}</sup>` : 'Hover over a country';

        } else {
            return props ? `<b>${props.name}</b><br />${value.toLocaleString('en-US')}${unit ? ` (${unit})` : ''}</sup>` : 'Hover over a country';
        }
    } else {
        return `<h4>${map_title}</h4>Hover over a country`;
    }
}

function initializeMap(map_title, property_name, container_name) {
    if (dataMap) {
        dataMap.remove();
    }

    // control that shows state info on hover
    const info = L.control();
    const features = asiaGeoData.features;
    const values = features.map(feature => feature.properties[property_name]);
    const legend = L.control({ position: 'bottomright' });

    // Define the geographical bounds
    var southWest = L.latLng(-85, -180);
    var northEast = L.latLng(85, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    dataMap = L.map(container_name, {
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    }).setView([20, 78.0], 5);

    // Hide the preloader once the map and data are fully loaded
    dataMap.on('load', function() {
        document.getElementById('preloader').style.display = 'none';
    });

    // Trigger the load event manually after adding the heatmap layer
    dataMap.fire('load');

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        minZoom: 3,
        attribution: '&copy; <a target="blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Tiles taken from &copy; <a target="blank" href="https://carto.com/attributions">CARTO</a>'
    }).addTo(dataMap);

    
    L.geoJSON(allCountries, { style: whiteStyle }).addTo(dataMap);

    // Add the rivers layer
    L.geoJSON(southAsiaRivers, {
        style: {
            color: 'blue',
            weight: 2
        }
    }).addTo(dataMap);

    // Sample heatmap data (latitude, longitude, intensity)
    var heatmapData = [
        [51.505, -0.09, 0.5], // [latitude, longitude, intensity]
        [51.515, -0.1, 0.8],
        [51.525, -0.11, 0.3],
        [51.535, -0.12, 0.7],
        [51.545, -0.13, 0.4]
    ];

    // Create a heatmap layer and add it to the map
    var heat = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
    }).addTo(dataMap);

    // Add indicators data for color overlay
    sources = indicatorsData.features
    const sourcesAttribution = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            this_source = sources.find(source => source.name_in_database === property_name);
            const div = L.DomUtil.create('div', 'source-attribution');
            div.innerHTML = `<div class="sources"><span>Source:</span> </br> <a href="${this_source.sources.url}" target="blank">${this_source.sources.text}</a></div>`;
            return div;
        }
    });
    
    // Add the custom attribution control to the map
    dataMap.addControl(new sourcesAttribution());

    if (property_name === 'marine_activities_plastic') {
        console.log('marine_activities_plastic');
    } else {
        const unit = getUnitOfMeasure(property_name);
        if (unit === '%') {
            grades = create_percent_intervals(values, unit);
        } else {
            grades = create_dynamic_intervals(values);
        }
    }

    // Create a popup instance for hover
    const hoverPopup = L.popup();

    // // Add the urban areas layer
    const urbanAreasLayer = L.geoJSON(urbanAreas, {
        style: {
            color: 'rgba(150, 10, 10, .9)',
            weight: 1
        }
    }).addTo(dataMap);

    
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        layer.bringToFront();

        // Bring urban areas layer to the front
        urbanAreasLayer.bringToFront();

        const { latlng } = e;
        const content = generatePopupContent(layer.feature.properties);
        hoverPopup
            .setLatLng(latlng)
            .setContent(content)
            .openOn(dataMap);

    }

    /* global statesData */
    const geojson = L.geoJson(asiaGeoData, {
        style,
        onEachFeature
    }).addTo(dataMap);

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        dataMap.fitBounds(e.target.getBounds());
    }

    // Apply color overlay and mouse actions
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
    
        // Create the title div
        // const titleDiv = L.DomUtil.create('div', 'legend-title', div);
        const unit = getUnitOfMeasure(property_name);
    
        // Change unit to "Percentage" if it is "%"
        let displayUnit = unit;
        if (unit === '%') {
            displayUnit = 'Percentage';
        }
    
        // Set the unit as the title with a line break
        // titleDiv.innerHTML = `<strong>${displayUnit}</strong><br><br>`;
        
        const labels = [];
        let from, to;
        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            const colorGroup = getColorGroup(property_name);
            const unit = getUnitOfMeasure(property_name); // Assuming you have a function to get the unit of measure

            labels.push(                
                `<i style="background:${getColor(from + 1, colorGroup, unit)}"></i> ${from.toLocaleString()} ${to ? ` &ndash; ${to.toLocaleString()}` : '+'}`
            );
        }
    
        // Check if any feature has "NA" data
        let hasNoData = false;
        asiaGeoData.features.forEach(feature => {
            if (feature.properties[property_name] === "NA") {
                hasNoData = true;
            }
        });
    
        // Add grey color for "No data available" if applicable
        if (hasNoData) {
            labels.push(
                `<i style="background:grey"></i> No data available`
            );
        }
    
        // Create the legend numbers and append the labels
        const legendNumbers = L.DomUtil.create('div', 'legend-numbers', div);
        legendNumbers.innerHTML = labels.join('<br>');
    
        return div;
    };
    
    legend.addTo(dataMap);

    // Add the urban areas layer
    L.geoJSON(urbanAreas, {
        style: {
            color: 'rgba(150, 10, 10, 1)',
            weight: 1
        }
    }).addTo(dataMap);
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    // Initialize the map based on the tabName
    ids.forEach(id => {
        if (tabName === `${id}_container`) {
            initializeMap(
                map_title = capitalizeWords(id.replace(/_/g, ' ')),
                property_name = id,
                container_name = `${id}_container`
            );
        }
    });
}

// Open the default tab
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".tablinks").click();
});