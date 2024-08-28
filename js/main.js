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

function createLegend(map, property_name, colorGroup, values) {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const unit = getUnitOfMeasure(property_name);
        let grades;

        if (unit === '%') {
            grades = create_percent_intervals(values, unit);
        } else {
            grades = create_dynamic_intervals(values);
        }

        const labels = [];

        // Create the title div
        const titleDiv = L.DomUtil.create('div', 'legend-title', div);
        let displayUnit = unit;
        if (unit === '%') {
            displayUnit = 'Percentage';
        }
        titleDiv.innerHTML = `<strong>${displayUnit}</strong><br><br>`;

        // Loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length - 1; i++) {
            let from = grades[i];
            let to = grades[i + 1];

            if (unit === '%') {
                from *= 100;
                to = to ? to * 100 : to;
            }

            labels.push(
                '<i style="background:' + getColor(from + 1, colorGroup, grades) + '"></i> ' +
                from + (to ? '&ndash;' + to + '<br>' : '+')
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
                '<i style="background:grey"></i> No data available'
            );
        }

        div.innerHTML += labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}

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
        minZoom: 3,
        attribution: '&copy; <a target="blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Tiles taken from &copy; <a target="blank" href="https://carto.com/attributions">CARTO</a>'
    }).addTo(dataMap);

    
    L.geoJSON(allCountries, { style: whiteStyle }).addTo(dataMap);

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    // Add data sources
    sources = indicatorsData.features

    // Assuming colorGroup is an array or object that you need to define
    const colorGroup = getColorGroup(property_name); // Define this function based on your logic

    // Custom attribution control
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

    let grades;
    
    // // Create a custom control for the attribution
    // const customAttribution = L.Control.extend({
    //     options: {
    //         position: 'bottomleft' // Position the control in the bottom left corner
    //     },

    //     onAdd: function (map) {
    //         // Create a div with a class name
    //         this_source = sources.find(source => source.name_in_database === property_name);
    //         const div = L.DomUtil.create('div', 'custom-attribution');
    //         div.innerHTML = `<div style="text-align: left; max-width: 300px">Source: ${this_source.sources}</div>`;
    //         return div;
    //     }
    // });
    
    // // Add the custom attribution control to the map
    // dataMap.addControl(new customAttribution());

    // let grades;
    
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
    
    // Ensure grades is defined before using it
    if (!grades || grades.length === 0) {
        console.error('Grades array is undefined or empty');
        grades = [0, 25, 50, 75, 100]; // Default grades as a fallback
    }

    // if (property_name === 'marine_activities_plastic') {
    //     console.log('marine_activities_plastic');
    // } else {
    //     const unit = getUnitOfMeasure(property_name);
    //     if (unit === '%') {
    //         grades = create_percent_intervals(values, unit);
    //     } else {
    //         grades = create_dynamic_intervals(values);
    //     }
    // }
    // if (property_name === 'marine_activities_plastic') {
    //     console.log('marine_activities_plastic');
    // } else {
    //     const unit = getUnitOfMeasure(property_name);
    //     if (unit === '%') {
    //         grades = create_percent_intervals(values, unit);
    //     } else {
    //         grades = create_dynamic_intervals(values);
    //     }
    // }

    // Create a popup instance for hover
    const hoverPopup = L.popup();

    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        layer.bringToFront();

        // Show popup with "lala" text at the mouse coordinates
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
        // info.update();
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

    legend.onAdd = function (dataMap) {
        return createLegend(dataMap, property_name, colorGroup, values);
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
}

// Open the default tab
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".tablinks").click();
});