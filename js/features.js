document.addEventListener("DOMContentLoaded", function() {

    const features = [
        {
            "indicator": "Population",
            "name_in_database": "population",
            "unit": "Number of people",
            "description": "Number of inhabitants in that country",
            "group": "socio-economic"
        },
        {
            "indicator": "Municipal solid waste generation",
            "name_in_database": "msw_generation",
            "unit": "tons/year",
            "description": "Municipal solid waste generation in tons per year",
            "group": "msw"
        },
        {
            "indicator": "Collected municipal solid waste",
            "name_in_database": "collected_msw",
            "unit": "%",
            "description": "Percentage of municipal solid waste that is collected",
            "group": "msw"
        },
        {
            "indicator": "Uncollected municipal solid waste",
            "name_in_database": "uncollected_msw",
            "unit": "%",
            "description": "Percentage of municipal solid waste that is not collected",
            "group": "msw"
        },
        {
            "indicator": "Percentage of plastics in the municipal solid waste",
            "name_in_database": "percentage_plastics_in_msw",
            "unit": "%",
            "description": "Percentage of plastics present in the municipal solid waste",
            "group": "msw"
        },
        {
            "indicator": "Municipal solid waste recycling",
            "name_in_database": "msw_recycling",
            "unit": "%",
            "description": "Percentage of municipal solid waste that is recycled",
            "group": "msw"
        },
        {
            "indicator": "Municipal solid waste openly burned at dumpsites",
            "name_in_database": "msw_openly_burned",
            "unit": "%",
            "description": "Percentage of municipal solid waste that is openly burned on dumpsites",
            "group": "msw"
        },
        {
            "indicator": "Plastic domestic consumption",
            "name_in_database": "plastic_domestic_consumption",
            "unit": "tons/year",
            "description": "Plastic domestic consumption per year in the country",
            "group": "plastic"
        },
        {
            "indicator": "Plastic use for packaging applications",
            "name_in_database": "plastic_use_packaging",
            "unit": "tons/year",
            "description": "From all the end-use applications, mass of plastics that are used in the packaging sector per year",
            "group": "plastic"
        },
        {
            "indicator": "Total plastic waste generation",
            "name_in_database": "plastic_waste_generation",
            "unit": "tons/year",
            "description": "Mass of plastic waste generation per year",
            "group": "plastic"
        },
        {
            "indicator": "Plastic waste collected",
            "name_in_database": "plastic_waste_collected",
            "unit": "tons/year",
            "description": "Mass of plastic waste collected per year",
            "group": "plastic"
        },
        {
            "indicator": "Plastic waste uncollected",
            "name_in_database": "plastic_waste_uncollected",
            "unit": "tons/year",
            "description": "Mass of plastic waste uncollected per year",
            "group": "plastic"
        },
        {
            "indicator": "Plastic waste openly burned at dumpsites",
            "name_in_database": "plastic_openly_burned",
            "unit": "tons/year",
            "description": "Mass of plastic waste that is openly burned on dumpsites",
            "group": "plastic"
        },
        {
            "indicator": "Plastic waste sent to recycling",
            "name_in_database": "plastic_recycling",
            "unit": "tons/year",
            "description": "Mass of plastic waste sent to recycling per year",
            "group": "plastic"
        },
        {
            "indicator": "Plastic waste leaked to marine environment",
            "name_in_database": "plastic_leaked_marine",
            "unit": "tons/year",
            "description": "Mass of plastic waste leaked to the marine environment per year, from land-sources",
            "group": "plastic"
        },
        {
            "indicator": "Marine-based activities plastic pollution",
            "name_in_database": "marine_activities_plastic",
            "unit": "tons/year",
            "description": "Mass of plastic waste leaked to the marine environment per year from marine-based sources, such as commercial fishery, navigation actions, waste disposal from cruise ships, and shellfish/fish culture.",
            "group": "plastic"
        },
    ]

    const parentElement = document.getElementById('parent-container');

    // Group features by the 'group' property
    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.group]) {
            acc[feature.group] = [];
        }
        acc[feature.group].push(feature);
        return acc;
    }, {});

    // Create containers for each feature
    features.forEach(feature => {
        const containerDiv = document.createElement('div');
        containerDiv.id = `${feature.name_in_database}_container`;
        containerDiv.className = 'tabcontent';

        const innerDiv = document.createElement('div');
        innerDiv.id = feature.name_in_database;

        containerDiv.appendChild(innerDiv);
        parentElement.appendChild(containerDiv);
    });
    
    const tabContainer = document.querySelector('#menu');

    // Create group containers and tabs
    Object.keys(groupedFeatures).forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-container';
        groupDiv.id = `${group}-group`;

        const groupTitle = document.createElement('h3');
        if (group.toLowerCase() === 'msw') {
            groupTitle.textContent = 'Waste management';
        } else if (group.toLowerCase() === 'plastic') {
            groupTitle.textContent = 'Plastic management';
        } else {
            groupTitle.textContent = capitalizeWords(group);
        }
        groupDiv.appendChild(groupTitle);

        groupedFeatures[group].forEach(feature => {
            const button = document.createElement('button');
            button.className = 'tablinks';
            button.setAttribute('onclick', `openTab(event, '${feature.name_in_database}_container')`);
            button.textContent = `${capitalizeWords(feature.name_in_database.replace(/_/g, ' '))} (${feature.unit})`;

            // Create tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = feature.description;

            button.appendChild(tooltip);
            groupDiv.appendChild(button);
        });

        tabContainer.appendChild(groupDiv);
    });
});