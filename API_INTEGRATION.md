# API Integration Guide

This React frontend is designed to work with your Laravel backend API. Here's how to set it up and use it.

## Backend Requirements

Your Laravel backend should have the following API endpoints:

### 1. Get All Promotions
```
GET /api/promotions
```
Returns: Array of promotion objects

### 2. Get Single Promotion
```
GET /api/promotions/{id}
```
Returns: Single promotion object

### 3. Create Promotion
```
POST /api/promotions
Content-Type: application/json

{
  "name": "Promotion Name",
  "is_active": 1,
  "starts_at": "2024-01-01T00:00:00Z",
  "ends_at": "2024-12-31T23:59:59Z",
  "priority": 100,
  "is_stackable": 0,
  "user_limit_total": 1000,
  "user_limit_per_day": 1,
  "global_quota": 5000,
  "global_budget": 100000.00,
  "max_payout_per_bill": 1000.00,
  "max_payout_per_day": 5000.00,
  "max_payout_per_user": 10000.00,
  "settings": {
    "type": "welcome_bonus",
    "bonus_percentage": 100
  }
}
```

### 4. Update Promotion
```
PUT /api/promotions/{id}
Content-Type: application/json
```

### 5. Delete Promotion
```
DELETE /api/promotions/{id}
```

### 6. Test Promotion (Optional)
```
POST /api/promotions/test/{id}
Content-Type: application/json
```

## Frontend Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:8000
```

### API Configuration
The API configuration is in `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PROMOTIONS: '/api/promotions',
    PROMOTION_TEST: '/api/promotions/test'
  }
}
```

## Features

### 1. Homepage
- Displays all promotions in a grid layout
- Filter by status (All, Active, Inactive)
- Shows promotion statistics
- Expandable cards with detailed information
- Error handling and loading states

### 2. Add Promotion Page
- Type selection (Welcome Bonus, Cashback, Weekend Bonus, etc.)
- Dynamic form fields based on promotion type
- Form validation
- API integration for creating promotions
- Loading states during submission

### 3. Promotion Types
- **Welcome Bonus**: Bonus percentage for new users
- **Cashback**: Return percentage of losses
- **Weekend Bonus**: Special weekend promotions with multiplier
- **Deposit Bonus**: Bonus on deposits with minimum amount
- **Referral Bonus**: Rewards for referring friends

## API Service

The `src/services/api.js` file contains all API methods:

```javascript
// Get all promotions
const promotions = await apiService.getPromotions()

// Create new promotion
const newPromotion = await apiService.createPromotion(promotionData)

// Update promotion
const updatedPromotion = await apiService.updatePromotion(id, data)

// Delete promotion
await apiService.deletePromotion(id)
```

## Error Handling

The frontend includes comprehensive error handling:

1. **Network errors**: Displayed to user with retry option
2. **Validation errors**: Form field validation with error messages
3. **API errors**: Proper error messages for failed requests
4. **Loading states**: Visual feedback during API calls

## CORS Configuration

Make sure your Laravel backend allows CORS requests from your frontend domain:

```php
// In config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:5173',
    // Add your production domain
],
```

## Development

1. Start the React development server:
```bash
npm run dev
```

2. Make sure your Laravel backend is running on the configured port (default: 8000)

3. The frontend will automatically connect to your Laravel API

## Production Deployment

1. Set the `REACT_APP_API_URL` environment variable to your production API URL
2. Build the React app: `npm run build`
3. Deploy the built files to your web server

## Database Schema

The frontend expects the following database structure (based on your Laravel routes):

```sql
CREATE TABLE promotions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    priority INT UNSIGNED NOT NULL DEFAULT 100,
    is_stackable TINYINT(1) NOT NULL DEFAULT 0,
    user_limit_total INT UNSIGNED NULL,
    user_limit_per_day INT UNSIGNED NULL,
    global_quota BIGINT UNSIGNED NULL,
    global_budget DECIMAL(12,2) NULL,
    max_payout_per_bill DECIMAL(12,2) NULL,
    max_payout_per_day DECIMAL(12,2) NULL,
    max_payout_per_user DECIMAL(12,2) NULL,
    settings JSON NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);
```
