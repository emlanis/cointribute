# API Reference

The Cointribute API provides programmatic access to platform features including charity data, donation processing, price conversion, and verification status.

## Base URL

Production: https://api.cointribute.xyz
Development: http://localhost:3001

## Endpoints

### Price Conversion

#### Get Current Prices

GET /api/prices?symbols=ETH,USDC

**Query Parameters:**
- symbols (string, required): Comma-separated list of symbols

**Response:**
```json
{
    "success": true,
    "data": {
        "ETH": {
            "price": 2500.50,
            "change_24h": 2.5,
            "last_updated": "2025-11-14T10:30:00Z"
        },
        "USDC": {
            "price": 1.00,
            "change_24h": 0.01,
            "last_updated": "2025-11-14T10:30:00Z"
        }
    }
}
```

### Charity Management

#### List All Charities

GET /api/charities

**Query Parameters:**
- status (string, optional): Filter by status (pending|approved|rejected)
- limit (number, optional): Results per page (default: 20, max: 100)
- offset (number, optional): Pagination offset

#### Get Charity Details

GET /api/charities/:id

**Path Parameters:**
- id (number, required): Charity ID

## Rate Limiting

| Tier | Requests/Hour | Burst |
|------|--------------|-------|
| **Free** | 1,000 | 20/sec |
| **Basic** | 10,000 | 50/sec |
| **Pro** | 100,000 | 100/sec |
