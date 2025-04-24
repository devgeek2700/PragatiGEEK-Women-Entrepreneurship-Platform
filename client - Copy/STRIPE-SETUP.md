# Stripe Integration Setup Guide

This guide explains how to properly set up and test Stripe integration in your development environment.

## HTTPS Setup for Development

Stripe.js requires HTTPS for live integrations, especially for Apple Pay or Google Pay features. Follow these steps to set up HTTPS locally:

1. **Generate self-signed certificates**

   ```bash
   # Navigate to your project directory
   cd client

   # Create certificates directory
   mkdir .cert

   # Generate certificates (Windows/Git Bash)
   openssl req -x509 -newkey rsa:2048 -keyout .cert/key.pem -out .cert/cert.pem -days 365 -nodes -subj "/CN=localhost"

   # For PowerShell, you may need a different syntax
   openssl req -x509 -newkey rsa:2048 -keyout .cert/key.pem -out .cert/cert.pem -days 365 -nodes -subj "//CN=localhost"
   ```

2. **Configure Vite for HTTPS**

   This is already set up in your `vite.config.js` file.

3. **Running the dev server**

   ```bash
   # Start the development server with HTTPS
   npm run dev
   ```

   When you open the application, you'll likely see a browser warning about the self-signed certificate. You can safely proceed (click "Advanced" and then "Proceed to localhost").

## Testing Stripe Payments

Use these test cards to simulate different payment scenarios:

| Card Number           | Scenario                      |
|-----------------------|-------------------------------|
| 4242 4242 4242 4242   | Successful payment            |
| 4000 0000 0000 0002   | Declined payment              |
| 4000 0025 0000 3155   | 3D Secure authentication      |
| 4000 0000 0000 3220   | 3D Secure 2 authentication    |

For all test cards:
- Use any future date for expiration (e.g., 12/25)
- Use any 3 digits for CVC
- Use any name

## Troubleshooting Common Stripe Issues

### 1. "You may test over HTTP" Warning

This warning appears when using Stripe.js over HTTP. It's informational only for development. In production, you must use HTTPS.

### 2. Apple Pay Domain Verification Error

For Apple Pay to work, you need to verify your domain with Apple. This isn't necessary for basic credit card payments or testing.

### 3. Server 500 Errors

If you encounter 500 errors when verifying payments:

1. Check the server logs for detailed error messages
2. Verify that your Stripe API keys are correctly set in your environment variables
3. Make sure your payment controller is properly handling the Stripe API responses

### 4. Payment Intent Creation Failures

Check that you're sending all required data when creating a payment intent:
- Product or course information
- Amount
- Customer information (as required by your implementation)

### 5. Common Error Messages and Solutions

#### "Cast to ObjectId failed" Error

This error typically occurs when MongoDB tries to convert a non-ObjectId string into a MongoDB ObjectId. Common scenarios:

1. **Invalid IDs in payment metadata**:
   - **Problem**: Your code is trying to use an invalid MongoDB ID (e.g., "Mentor Ananya Mehta" instead of a proper ID).
   - **Solution**: Ensure you're storing valid MongoDB ObjectIDs in your Stripe metadata, not user-friendly names or strings.

2. **Missing validation checks**:
   - **Problem**: Your code assumes all IDs are valid MongoDB ObjectIDs without checking first.
   - **Solution**: Add validation using `mongoose.Types.ObjectId.isValid(id)` before using any ID for database operations.

3. **ID format mismatch**:
   - **Problem**: You're trying to use a string that looks like an ID but isn't in the correct format.
   - **Solution**: Only use IDs directly from MongoDB objects (`_id` fields).

Example fix in code:
```javascript
// Before using an ID for lookup
if (mongoose.Types.ObjectId.isValid(courseId)) {
  // Safe to use courseId for MongoDB queries
  const course = await Course.findById(courseId);
} else {
  console.error("Invalid ID format:", courseId);
  // Handle the error appropriately
}
```

## Using Stripe in Production

Before going to production:

1. Replace test API keys with production keys
2. Complete domain verification for Apple Pay (if used)
3. Ensure your server is using HTTPS
4. Set up proper webhook handling for asynchronous events
5. Implement proper error handling and logging for all Stripe operations

For more details on Stripe integration, refer to the [Stripe Documentation](https://stripe.com/docs). 