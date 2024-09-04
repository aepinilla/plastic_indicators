const ids = [
    'population',
    'plastic_domestic_consumption',
    'plastic_use_packaging',
    'msw_generation',
    'collected_msw',
    'uncollected_msw',
    'percentage_plastics_in_msw',
    'msw_recycling',
    'msw_openly_burned',
    'plastic_waste_generation',
    'plastic_waste_collected',
    'plastic_waste_uncollected',
    'plastic_openly_burned',
    'plastic_recycling',
    'plastic_leaked_marine',
    'marine_activities_plastic',
    'plastic_leakage'
];

// Extract units of measure
function getUnitOfMeasure(nameInDatabase) {
    const indicators = indicatorsData.features;
    const indicator = indicators.find(indicator => indicator.name_in_database === nameInDatabase);
    return indicator ? indicator.unit : null;
}

function getColorGroup(nameInDatabase) {
    const indicators = indicatorsData.features;
    const indicator = indicators.find(indicator => indicator.name_in_database === nameInDatabase);
    const colorGroup = indicator ? indicator.group : null;
    return colorGroup;
}

// Function to round numbers to the nearest power of 10
function roundToNearestPowerOf10(num) {
    return Math.pow(10, Math.floor(Math.log10(num)));
}


function create_percent_intervals(values, unit) {
    // Filter out zero and "NA" values if necessary
    const filteredValues = values.filter(value => value !== 0 && value !== "NA");

    // If all values are zero or "NA" or the array is empty after filtering, handle it
    if (filteredValues.length === 0) {
        return [0]; // Return a single interval with 0
    }

    // Define fixed quantiles
    const quantiles = [0, 25, 50, 75, 100];

    return quantiles;
}


function create_dynamic_intervals(values) {
    // Filter out zero and "NA" values if necessary
    const filteredValues = values.filter(value => value !== 0 && value !== "NA");

    // If all values are zero or "NA" or the array is empty after filtering, handle it
    if (filteredValues.length === 0) {
        return [0]; // Return a single interval with 0
    }

    // Calculate dynamic intervals
    const min = Math.min(...filteredValues);
    const max = Math.max(...filteredValues);
    const range = max - min;
    const interval = range / 7;

    // Define dynamic grades with non-overlapping intervals
    const grades = [];
    let current = roundToNearestPowerOf10(min);

    while (current < max) {
        grades.push(current);
        current = roundToNearestPowerOf10(current * 10); // Adjust the multiplier as needed
    }
    grades.push(current); // Ensure the last interval covers up to max

    return grades;
}

function capitalizeWords(string) {
    if (typeof string !== 'string' || string.length === 0) {
        return string;
    }

    return string.split(' ').map((word, index) => {
        if (word.toLowerCase() === 'msw') {
            return word.toUpperCase();
        }
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
}

const colorGroups = {
    blue: ['#08306b', '#08519c', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7'],
    green: ['#00441b', '#006d2c', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0', '#e5f5e0'],
    yellow: ['#b37b00', '#d48800', '#f59e00', '#ffb300', '#ffcc33', '#ffe066', '#fff399', '#ffffcc'],
};

function getColor(d, colorGroup) {
    // Check if the value is "NA" and return grey color
    if (d === "NA") {
        console.log(`Value: ${d}, Color: #808080`); // Print the value and color to the console
        return '#808080'; // Grey color
    }

    let colors;
    if (colorGroup === "plastic") {
        colors = colorGroups.blue;
    } else if (colorGroup === "msw") {
        colors = colorGroups.yellow;
    } else {
        colors = colorGroups[colorGroup] || colorGroups['green']; // Default to 'green' if colorGroup is not found
    }

    const color = d > grades[grades.length - 1] ? colors[0] :
                  d > grades[grades.length - 2] ? colors[1] :
                  d > grades[grades.length - 3] ? colors[2] :
                  d > grades[grades.length - 4] ? colors[3] :
                  d > grades[grades.length - 5] ? colors[4] :
                  d > grades[grades.length - 6] ? colors[5] :
                  d > grades[grades.length - 7] ? colors[6] : colors[7];

    console.log(`Value: ${d}, Color: ${color}`); // Print the value and color to the console
    return color;
}

function getColorMap(d, colorGroup, unit) {
    // Check if the value is "NA" and return grey color
    if (d === "NA") {
        console.log(`Value: ${d}, Color: #808080`); // Print the value and color to the console
        return '#808080'; // Grey color
    }

    // Scale the value from 0-1 to 1-100 if the unit is "%"
    let scaledValue = d;
    if (unit === '%') {
        scaledValue = d * 100;
    }

    let colors;
    if (colorGroup === "plastic") {
        colors = colorGroups.blue;
    } else if (colorGroup === "msw") {
        colors = colorGroups.yellow;
    } else {
        colors = colorGroups[colorGroup] || colorGroups['green']; // Default to 'green' if colorGroup is not found
    }

    const color = scaledValue > grades[grades.length - 1] ? colors[0] :
                  scaledValue > grades[grades.length - 2] ? colors[1] :
                  scaledValue > grades[grades.length - 3] ? colors[2] :
                  scaledValue > grades[grades.length - 4] ? colors[3] :
                  scaledValue > grades[grades.length - 5] ? colors[4] :
                  scaledValue > grades[grades.length - 6] ? colors[5] :
                  scaledValue > grades[grades.length - 7] ? colors[6] : colors[7];

    console.log(`Value: ${scaledValue}, Color: ${color}`); // Print the scaled value and color to the console
    return color;
}

function style(feature) {
    const colorGroup = getColorGroup(property_name);
    const unit = getUnitOfMeasure(property_name); // Assuming you have a function to get the unit of measure

    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        fillColor: getColorMap(feature.properties[property_name], colorGroup, unit)
    };
}

const allCountries = worldMap.features;

// Function to style the GeoJSON layer
function whiteStyle(feature) {
    return {
        fillColor: '#FFFFFF', // White fill color
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity:  1
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('navbarNav');
    const buttons = menu.getElementsByClassName('tablinks');

    Array.from(buttons).forEach(button => {
        button.addEventListener('click', function() {
            menu.classList.remove('show'); // Remove the "show" class
        });
    });
});