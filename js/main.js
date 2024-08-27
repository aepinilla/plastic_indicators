let dataMap;
let mouseX = 0;
let mouseY = 0;
const container = document.getElementById('parent-container'); // Replace 'container-id' with the actual ID of your container

function initializeMap(map_title, property_name, container_name) {
    if (dataMap) {
        dataMap.remove();
    }

    // control that shows state info on hover
    const info = L.control();
    const features = asiaGeoData.features;
    const values = features.map(feature => feature.properties[property_name]);
    const unit = getUnitOfMeasure(property_name);
    const legend = L.control({ position: 'bottomright' });

    // Step 1: Define the geographical bounds
    var southWest = L.latLng(-85, -180);
    var northEast = L.latLng(85, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    dataMap = L.map(container_name, {
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    }).setView([20, 78.0], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        minZoom: 5,
        attribution: '&copy; <a target="blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Tiles taken from &copy; <a target="blank" href="https://carto.com/attributions">CARTO</a>'
    }).addTo(dataMap);

    
    L.geoJSON(allCountries, { style: whiteStyle }).addTo(dataMap);

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        if (props) {
            const unit = getUnitOfMeasure(property_name);
            let value = props[property_name];
    
            // Handle cases where the value is "NA"
            if (value === "NA") {
                this._div.innerHTML = `<h4>${map_title}</h4><b>${props.name}</b><br />No data available`;
                return;
            }
    
            // Multiply the value by 100 if the unit is '%'
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

    // Add data sources
    sources = indicatorsData.features
    // Create a custom control for the attribution
    const customAttribution = L.Control.extend({
        options: {
            position: 'bottomleft' // Position the control in the bottom left corner
        },

        onAdd: function (map) {
            // Create a div with a class name
            this_source = sources.find(source => source.name_in_database === property_name);
            const div = L.DomUtil.create('div', 'custom-attribution');
            div.innerHTML = `<div style="text-align: left; max-width: 300px">Source: ${this_source.sources}</div>`;
            return div;
        }
    });
    
    // Add the custom attribution control to the map
    dataMap.addControl(new customAttribution());

    // this_source = sources.find(source => source.name_in_database === property_name);
    // dataMap.attributionControl.addAttribution(`<div style="text-align: left;"><br>Data source: ${this_source.sources}</div>`);
    

    if (property_name === 'marine_activities_plastic') {
        console.log('marine_activities_plastic');
    } else {
        grades = create_dynamic_intervals(values);
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

    /* global statesData */
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

    // dataMap.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');

        // Create the title div
        const titleDiv = L.DomUtil.create('div', 'legend-title', div);
        const unit = getUnitOfMeasure(property_name);

        // Change unit to "Percentage" if it is "%"
        let displayUnit = unit;
        if (unit === '%') {
            displayUnit = 'Percentage';
        }

        // Set the unit as the title with a line break
        titleDiv.innerHTML = `<strong>${displayUnit}</strong><br><br>`;
        
        const labels = [];
        let from, to;
        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            // Multiply by 100 if the unit is "Percentage"
            if (unit === '%') {
                from *= 100;
                to = to ? to * 100 : to;
            }
            const colorGroup = getColorGroup(property_name);

            labels.push(
                `<i style="background:${getColor(from + 1, colorGroup)}"></i> ${from.toLocaleString()} ${to ? ` &ndash; ${to.toLocaleString()}` : '+'}`
            );
        }

        // Create the numbers div and append the labels
        const numbersDiv = L.DomUtil.create('div', 'legend-numbers', div);
        numbersDiv.innerHTML = labels.join('<br>');

        return div;
    };

    legend.addTo(dataMap);
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

    // Initialize an empty map if the "plastic leakage" tab is opened
    if (tabName === 'leakage_container') {
        initializeLeakageMap();
    }
}

// Open the default tab
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".tablinks").click();
});