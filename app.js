const scanBtn = document.getElementById('scan-btn');
const dateInput = document.getElementById('scan-date');
const hazardCheckbox = document.getElementById('hazard-only');
const audioCheckbox = document.getElementById('audio-enabled');
const resultsContainer = document.getElementById('results-container');
const systemStatus = document.getElementById('system-status');

let cachedAsteroids = [];

// Default the date picker to today's date
dateInput.value = new Date().toISOString().slice(0, 10);

scanBtn.addEventListener('click', fetchOrbitalData);
hazardCheckbox.addEventListener('change', renderTargets);

// --- Web Audio API Synthesizer ---
function playScannerBeep() {
    if (!audioCheckbox.checked) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

function playCloisterBell() {
    if (!audioCheckbox.checked) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    function triggerStrike(startTime) {
        const partials = [
            { freq: 73.42,  type: 'sine',     gain: 0.35, decay: 3.8 },
            { freq: 146.83, type: 'triangle', gain: 0.22, decay: 3.2 },
            { freq: 174.61, type: 'sine',     gain: 0.16, decay: 2.8 },
            { freq: 207.65, type: 'sine',     gain: 0.14, decay: 2.4 },
            { freq: 311.13, type: 'sine',     gain: 0.08, decay: 1.4 }
        ];

        partials.forEach(p => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = p.type;
            osc.frequency.setValueAtTime(p.freq * 1.015, startTime);
            osc.frequency.exponentialRampToValueAtTime(p.freq, startTime + 0.12);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(p.gain, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + p.decay);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + p.decay);
        });

        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const clankGain = ctx.createGain();

        carrier.frequency.setValueAtTime(293.66, startTime);
        modulator.frequency.setValueAtTime(415.30, startTime);
        modGain.gain.setValueAtTime(350, startTime);
        modGain.gain.exponentialRampToValueAtTime(1, startTime + 0.25);

        clankGain.gain.setValueAtTime(0.18, startTime);
        clankGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(clankGain);
        clankGain.connect(ctx.destination);

        carrier.start(startTime);
        modulator.start(startTime);
        carrier.stop(startTime + 0.35);
        modulator.stop(startTime + 0.35);
    }

    const now = ctx.currentTime;
    triggerStrike(now);
    triggerStrike(now + 1.65);
}

// --- Fetch Live Telemetry via NASA DEMO_KEY ---
async function fetchOrbitalData() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        systemStatus.textContent = 'ERROR: INVALID TEMPORAL COORDINATES';
        return;
    }

    playScannerBeep();
    systemStatus.textContent = `SCANNING TEMPORAL SECTOR [${selectedDate}]...`;
    resultsContainer.innerHTML = '';

    const host = ['https://api', 'nasa', 'gov'].join('.');
    const path = ['', 'neo', 'rest', 'v1', 'feed'].join('/');
    const params = new URLSearchParams({
        start_date: selectedDate,
        end_date: selectedDate,
        api_key: 'DEMO_KEY'
    });

    try {
        const response = await fetch(`${host}${path}?${params.toString()}`);
        if (response.status === 429) {
            systemStatus.textContent = 'TEMPORAL RELAY OVERLOADED (HOURLY LIMIT) - TRY AGAIN SHORTLY';
            return;
        }
        if (!response.ok) throw new Error(`NASA status: ${response.status}`);

        const data = await response.json();
        cachedAsteroids = data.near_earth_objects[selectedDate] || [];

        const hazardCount = cachedAsteroids.filter(a => a.is_potentially_hazardous_asteroid).length;

        if (hazardCount > 0) {
            systemStatus.textContent = `ALERT - ${hazardCount} HOSTILE FLEET SIGNATURE(S) DETECTED`;
            playCloisterBell();
        } else {
            systemStatus.textContent = `SCAN COMPLETE - ${cachedAsteroids.length} BENIGN OBJECTS DETECTED`;
        }

        renderTargets();

    } catch (error) {
        systemStatus.textContent = 'ERROR: TORCHWOOD RELAY OFFLINE';
        console.error('Detailed error:', error);
    }
}

// --- Render Filtered Cards & Expanded JPL Metrics ---
function renderTargets() {
    resultsContainer.innerHTML = '';

    const showHazardsOnly = hazardCheckbox.checked;
    const filtered = showHazardsOnly
        ? cachedAsteroids.filter(a => a.is_potentially_hazardous_asteroid)
        : cachedAsteroids;

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p>NO MATCHING SIGNATURES IN THIS TEMPORAL SECTOR.</p>';
        return;
    }

    filtered.forEach(asteroid => {
        const name = asteroid.name;
        const isHazardous = asteroid.is_potentially_hazardous_asteroid;
        const diameter = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max);
        
        const approach = asteroid.close_approach_data.at(0);
        const speed = Math.round(approach.relative_velocity.kilometers_per_hour);
        const missKm = Math.round(approach.miss_distance.kilometers);
        const missLunar = Number(approach.miss_distance.lunar).toFixed(1);
        const jplUrl = asteroid.nasa_jpl_url;

        const card = document.createElement('div');
        card.className = isHazardous ? 'target-card hazard' : 'target-card';

        const threatAnalysis = isHazardous
            ? '<span class="alert-badge">[WARNING: POSSIBLE CYBERMAN / DALEK FLEET MOVEMENT]</span>'
            : '<span>[CLASSIFICATION: HARMLESS SPACE DEBRIS]</span>';

        card.innerHTML = `
            <h3>DESIGNATION: ${name}</h3>
            <p>${threatAnalysis}</p>
            <p>ESTIMATED DIAMETER: ${diameter.toLocaleString()} meters</p>
            <p>APPROACH VELOCITY: ${speed.toLocaleString()} km/h</p>
            <p>MISS DISTANCE: ${missKm.toLocaleString()} km (${missLunar} Lunar Distances)</p>
            <a class="jpl-link" href="${jplUrl}" target="_blank" rel="noopener noreferrer">ACCESS NASA JPL ORBITAL TRAJECTORY</a>
        `;

        resultsContainer.appendChild(card);
    });
}
