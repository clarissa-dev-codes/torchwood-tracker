# Torchwood Three // Orbital Defense Scanner

A browser-based *Doctor Who* themed orbital monitoring terminal powered by real-time telemetry from NASA's Near-Earth Object Web Service (NeoWs) API.

## Overview

Modeled after a Torchwood Three deep-space defense console, this web application queries live NASA asteroid tracking data for any selected date and classifies approaching objects using *Doctor Who* lore. Potentially hazardous near-Earth objects are flagged as possible Cyberman or Dalek fleet movements and trigger a synthesized Eleventh Doctor-era TARDIS Cloister Bell alarm.

## Features

- **Live NASA NeoWs Telemetry:** Fetches real-time asteroid names, estimated maximum diameters, approach velocities, and miss distances in both kilometers and lunar distances.
- **Time-Vortex Date Picker:** Scan any past or future date on the calendar to inspect historical or upcoming near-Earth approaches.
- **Hostile Fleet Filter:** Toggle between all detected space debris and potentially hazardous objects only.
- **Web Audio API Synthesizer:** Generates retro console scanning tones and a multi-harmonic, double-toll TARDIS Cloister Bell alert directly in the browser without external audio files.
- **NASA JPL Trajectory Links:** Direct links to NASA Jet Propulsion Laboratory orbital diagrams for every detected object.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+, Fetch API, Web Audio API)
- NASA Open APIs (NeoWs)
- Hosted via GitHub Pages

## Project Structure

```text
torchwood-tracker/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Setup and Usage

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser, or visit the live GitHub Pages deployment.
3. Select a target date in the **Temporal Coordinates** field and click **Initiate Deep Space Scan**.

*Note: This project uses NASA's public `DEMO_KEY` for client-side requests, which allows up to 30 requests per hour per IP address.*

## Disclaimer

This is a non-commercial, fan-made educational project. *Doctor Who* and *Torchwood* are trademarks of the BBC. Space telemetry data is provided courtesy of NASA's Open APIs.
