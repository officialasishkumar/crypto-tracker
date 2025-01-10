# Crypto Tracker Backend

This is the backend for the Crypto Tracker application, which fetches and stores cryptocurrency data from the CoinGecko API and provides statistical insights through APIs. The backend is built using Node.js, Express, MongoDB, and a scheduled job for data collection.

## Hosted URL

The backend is hosted at:  
**[https://crypto-tracker-gebo.onrender.com](https://crypto-tracker-gebo.onrender.com)**

## API Endpoints

### 1. Get Latest Cryptocurrency Statistics

**Endpoint:** `/stats`  
**Method:** `GET`  

Retrieve the latest statistics for a specified cryptocurrency.

#### Query Parameters:
- `coin` (required): The ID of the cryptocurrency (e.g., `bitcoin`, `matic-network`, `ethereum`).

#### Example Request:
```bash
GET https://crypto-tracker-gebo.onrender.com/stats?coin=bitcoin
```

#### Example Response:
```json
{
  "price": 43214.34,
  "marketCap": 813542131234,
  "24hChange": -1.23
}
```

#### Error Responses:
- **400:** If the `coin` parameter is missing.
- **404:** If no data is found for the specified coin.
- **500:** If there's a server error.

---

### 2. Get Standard Deviation of Cryptocurrency Prices

**Endpoint:** `/deviation`  
**Method:** `GET`  

Calculate the standard deviation of the last 100 recorded prices for a specified cryptocurrency.

#### Query Parameters:
- `coin` (required): The ID of the cryptocurrency (e.g., `bitcoin`, `matic-network`, `ethereum`).

#### Example Request:
```bash
GET https://crypto-tracker-gebo.onrender.com/deviation?coin=bitcoin
```

#### Example Response:
```json
{
  "deviation": 234.56
}
```

#### Error Responses:
- **400:** If the `coin` parameter is missing.
- **404:** If no data is found for the specified coin.
- **500:** If there's a server error.

---

## Technology Stack

- **Node.js**: Server-side runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing cryptocurrency data.
- **Mongoose**: MongoDB object modeling for Node.js.
- **Axios**: HTTP client for fetching data from CoinGecko API.
- **node-cron**: Scheduler for periodic data updates.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- CoinGecko API (no authentication required)

---

## How it Works

1. The application fetches cryptocurrency data every 2 hours using the CoinGecko API.
2. Data is stored in a MongoDB database, including the price, market cap, 24-hour percentage change, and timestamp.
3. Users can query the latest cryptocurrency statistics or calculate the standard deviation of recent prices using the provided endpoints.