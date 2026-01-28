# Manawatch

A Magic: The Gathering card price tracking and portfolio management app built with Angular.

<img width="400" height="600" alt="Screenshot 2026-01-27 193202" src="https://github.com/user-attachments/assets/cd6e8e0d-1df2-4676-ad13-b511cb9ca633" />

<img width="400" height="600" alt="Screenshot 2026-01-27 193212" src="https://github.com/user-attachments/assets/cd89c0c2-aa73-42ea-8151-db44ba378ee8" />
<img width="400" height="600" alt="Screenshot 2026-01-27 193233" src="https://github.com/user-attachments/assets/1dfea07f-6806-469b-89cd-7fce6e6e3282" />
<img width="400" height="600" alt="Screenshot 2026-01-27 193129" src="https://github.com/user-attachments/assets/572ac95d-d040-402d-8392-8c8f1dd64be4" />

## Features

- **Search & Browse** - Find Magic cards using Scryfall's comprehensive database
- **Price Charts** - Track historical pricing data with interactive Chart.js visualizations
- **Watchlist** - Create a personal watchlist to monitor cards you're interested in
- **Portfolio Value** - View your total watchlist value and price trends
- **Market Insights** - Stay updated with trending cards and news from MTGStocks
- **Authentication** - Secure login with Firebase

## Tech Stack

- **Frontend** - Angular, TypeScript, Tailwind CSS
- **Backend** - Vercel serverless functions (Node.js)
- **Charts** - Chart.js
- **Data Sources** - Scryfall, MTGJSON (GraphQL), PriceCharting, MTGStocks
- **Database & Auth** - Firebase

## Project Structure
├── src/ # Angular frontend application
├── api/
│ └── mtgjson.js # GraphQL queries to MTGJSON API
