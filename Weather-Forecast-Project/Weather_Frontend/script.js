// Create animated sky background
function initializeSky() {
    console.log('Sky background initialized with clouds and sun');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSky();
    
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');
    const currentCitySpan = document.getElementById('currentCity');
    const currentTempSpan = document.getElementById('currentTemp');
    const currentConditionSpan = document.getElementById('currentCondition');
    const currentHumiditySpan = document.getElementById('currentHumidity');
    const currentWindSpan = document.getElementById('currentWind');
    const forecastDiv = document.getElementById('forecast');
    const errorMessageDiv = document.getElementById('errorMessage');

    const API_BASE_URL = 'https://i7t1xa3czg.execute-api.us-east-1.amazonaws.com/default/WeatherForecastFunction?city=';

    searchButton.addEventListener('click', fetchWeatherData);
    cityInput.addEventListener('keypress', e => { if(e.key==='Enter') fetchWeatherData(); });

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
    }

    function getEmojiAndClass(condition) {
        const desc = condition.toLowerCase();
        if(desc.includes("clear") || desc.includes("sun")) return ["☀️","sun"];
        if(desc.includes("partly") && desc.includes("cloud")) return ["⛅","cloud"];
        if(desc.includes("cloud") || desc.includes("overcast")) return ["☁️","cloud"];
        if(desc.includes("rain") || desc.includes("shower")) return ["🌧️","rain"];
        if(desc.includes("storm") || desc.includes("thunder")) return ["⛈️","storm"];
        if(desc.includes("snow") || desc.includes("blizzard")) return ["❄️","snow"];
        if(desc.includes("mist") || desc.includes("fog")) return ["🌫️","cloud"];
        if(desc.includes("wind")) return ["💨","cloud"];
        if(desc.includes("hot")) return ["🔥","sun"];
        if(desc.includes("cold")) return ["🥶","snow"];
        return ["🌤️","sun"];
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            currentCitySpan.textContent = 'Loading...';
            currentCitySpan.classList.add('loading');
            currentTempSpan.textContent = '--°C';
            currentConditionSpan.textContent = '---';
            currentHumiditySpan.textContent = '--%';
            currentWindSpan.textContent = '-- km/h';
            forecastDiv.innerHTML = '';
        } else {
            currentCitySpan.classList.remove('loading');
        }
    }

    async function fetchWeatherData() {
        const city = cityInput.value.trim() || "Peddapuram";

        errorMessageDiv.style.display = 'none';
        setLoadingState(true);

        try {
            const response = await fetch(`${API_BASE_URL}${encodeURIComponent(city)}`);
            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Current weather with animation
            const curr = data.Current;
            setTimeout(() => {
                currentCitySpan.textContent = data.CityName;
                currentTempSpan.textContent = `${curr.Temperature}°C`;
                currentConditionSpan.textContent = curr.Condition;
                currentHumiditySpan.textContent = `${curr.Humidity}%`;
                currentWindSpan.textContent = `${curr.WindSpeed} km/h`;
                setLoadingState(false);
            }, 500);

            // 7-Day Forecast with staggered animation
            if(data.Forecast && data.Forecast.length > 0){
                data.Forecast.forEach((f, index) => {
                    setTimeout(() => {
                        const div = document.createElement('div');
                        div.className = 'forecast-block';
                        const [emojiChar, emojiClass] = getEmojiAndClass(f.Condition);
                        div.innerHTML = `
                            <p><strong>${formatDate(f.Date)}</strong></p>
                            <p class="emoji ${emojiClass}">${emojiChar}</p>
                            <p><strong>${f.Temperature}°C</strong></p>
                            <p>${f.Condition}</p>`;
                        forecastDiv.appendChild(div);
                    }, index * 100);
                });
            } else {
                setTimeout(() => {
                    forecastDiv.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No forecast data available.</p>';
                }, 700);
            }

            cityInput.value = '';
        } catch(e){
            console.error(e);
            setLoadingState(false);
            errorMessageDiv.textContent = `Failed to fetch weather: ${e.message}`;
            errorMessageDiv.style.display = 'block';
            currentCitySpan.textContent = '---';
            currentTempSpan.textContent = '--°C';
            currentConditionSpan.textContent = '---';
            currentHumiditySpan.textContent = '--%';
            currentWindSpan.textContent = '-- km/h';
        }
    }

    // Fetch default city on load
    fetchWeatherData();
});