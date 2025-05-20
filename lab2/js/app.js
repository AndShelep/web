const dateInput = document.getElementById('forecast-date');
const weatherBtn = document.getElementById('get-weather');
const resultDiv = document.getElementById('weather-result');

const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

weatherBtn.addEventListener('click', () => {
    const date = dateInput.value;
    if (!date) {
        resultDiv.textContent = 'Please select a date.';
        return;
    }

    const lat = 50.45;
    const lon = 30.52;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${date}&end_date=${date}`)
        .then((res) => {
            if (!res.ok) throw new Error('Weather fetch failed');
            return res.json();
        })
        .then((data) => {
            const max = data.daily.temperature_2m_max[0];
            const min = data.daily.temperature_2m_min[0];
            resultDiv.textContent = `Forecast for ${date}: from ${min}°C to ${max}°C`;
        })
        .catch((err) => {
            console.error(err);
            resultDiv.textContent = 'Could not load weather data.';
        });
});

const jokeBtn = document.getElementById('get-joke');
const jokeBox = document.getElementById('joke-result');

jokeBtn.addEventListener('click', () => {
    fetch('https://icanhazdadjoke.com/', {
        headers: {
            Accept: 'application/json',
        },
    })
        .then((res) => res.json())
        .then((data) => {
            jokeBox.textContent = data.joke;
        })
        .catch((err) => {
            console.error(err);
            jokeBox.textContent = 'Failed to load a joke.';
        });
});

const chatSocket = new WebSocket('ws://localhost:3000');
const chatBox = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-chat');

sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
        chatSocket.send(msg);
        chatInput.value = '';
    }
});

chatSocket.onmessage = (event) => {
    const reader = new FileReader();
    reader.onload = function () {
        const p = document.createElement('p');
        p.textContent = reader.result;
        chatBox.appendChild(p);
        chatBox.scrollTop = chatBox.scrollHeight;
    };
    reader.readAsText(event.data);
};
