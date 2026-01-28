# Manawatch

A Magic: The Gathering card price tracking and portfolio management app built with Angular.

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