// Function to load the JSON Vega-Lite spec, update it with filters, and render the chart
async function loadAndRenderChart(state, year) {
    // Fetch the CSV data
    const dataResponse = await fetch('https://raw.githubusercontent.com/reneeyst23/FIT3179-Week-10/refs/heads/main/data/death_sex_ethnic_state.csv');
    const data = await dataResponse.text();

    // Parse CSV data
    const parsedData = data.split('\n').slice(1).map(row => {
        const [stateRow, date, sex, ethnicity, abs] = row.split(',');
        const yearRow = date.split('/')[2]; // Extract year
        return { state: stateRow, year: yearRow, sex, abs: parseInt(abs) };
    });

    // Filter data by selected state and year
    const filteredData = parsedData.filter(d => d.state === state && d.year === year);

    // Calculate totals for each gender
    const maleTotal = filteredData.filter(d => d.sex === 'male').reduce((acc, curr) => acc + curr.abs, 0);
    const femaleTotal = filteredData.filter(d => d.sex === 'female').reduce((acc, curr) => acc + curr.abs, 0);

    // Fetch the external Vega-Lite spec
    const specResponse = await fetch('donutChart.json');
    const spec = await specResponse.json();

    // Update the data values in the spec
    spec.data.values = [
        { "sex": "male", "total": maleTotal },
        { "sex": "female", "total": femaleTotal }
    ];

    // Render the Vega-Lite chart with the updated specification
    vegaEmbed('#donutChart', spec);
}

// Function to fetch unique states and years from the dataset
async function fetchUniqueValues() {
    const response = await fetch('https://raw.githubusercontent.com/reneeyst23/FIT3179-Week-10/refs/heads/main/data/death_sex_ethnic_state.csv');  // Replace with your dataset URL
    const data = await response.text();

    const parsedData = data.split('\n').slice(1).map(row => {
        const [state, date, sex, ethnicity, abs] = row.split(',');
        const year = date.split('/')[2];  // Extracting the year from the date
        return { state, year, sex, ethnicity, abs: parseInt(abs) };
    });

    const uniqueStates = [...new Set(parsedData.map(item => item.state))];
    const uniqueYears = [...new Set(parsedData.map(item => item.year))];

    return { uniqueStates, uniqueYears };
}

// Function to populate the dropdown filters
async function populateFilters() {
    const { uniqueStates, uniqueYears } = await fetchUniqueValues();

    const stateFilter = document.getElementById('stateFilter');
    const yearFilter = document.getElementById('yearFilter');

    uniqueStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateFilter.appendChild(option);
    });

    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    // Initial chart rendering based on the first state and year
    loadAndRenderChart(stateFilter.value, yearFilter.value);

    // Add event listeners to update the chart based on filter changes
    stateFilter.addEventListener('change', () => {
        loadAndRenderChart(stateFilter.value, yearFilter.value);
    });

    yearFilter.addEventListener('change', () => {
        loadAndRenderChart(stateFilter.value, yearFilter.value);
    });
}

// Call the function to populate filters and render the initial chart
populateFilters();