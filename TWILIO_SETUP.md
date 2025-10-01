# Twilio OTP Integration Setup Guide

This guide will help you set up Twilio for OTP verification in the MittiMoney application.

## Prerequisites

1. A Twilio account (sign up at [twilio.com](https://www.twilio.com))
2. A verified phone number in your Twilio account

## Setup Steps

### 1. Get Your Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. From the dashboard, copy your **Account SID** and **Auth Token**

### 2. Create a Verify Service

1. Navigate to **Verify** > **Services** in the Twilio Console
2. Click **Create new Service**
3. Give your service a name (e.g., "MittiMoney OTP")
4. Copy the **Service SID** that gets generated

### 3. Configure Environment Variables

Create a `.env.local` file in your project root and add:

\`\`\`env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
\`\`\`

Replace the placeholder values with your actual Twilio credentials.

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the phone authentication page
3. Enter a valid phone number (must be verified in Twilio for trial accounts)
4. You should receive an SMS with the OTP code
5. Enter the code to complete verification

## Important Notes

- **Trial Account Limitations**: Twilio trial accounts can only send SMS to verified phone numbers
- **Phone Number Format**: The app automatically formats numbers to E.164 format (+91xxxxxxxxxx for India)
- **Rate Limiting**: Twilio has built-in rate limiting to prevent abuse
- **Cost**: Each SMS verification costs money on paid Twilio accounts

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**: Double-check your Account SID and Auth Token
2. **"Service not found" error**: Verify your Verify Service SID is correct
3. **SMS not received**: Ensure the phone number is verified in your Twilio account (for trial accounts)
4. **"Invalid phone number" error**: Make sure the number is in correct format

### Error Handling

The app includes comprehensive error handling for:
- Network connectivity issues
- Invalid phone numbers
- Incorrect OTP codes
- Twilio service errors

## Security Best Practices

1. Never commit your `.env.local` file to version control
2. Use environment variables for all sensitive credentials
3. Consider implementing rate limiting on your API endpoints
4. Monitor your Twilio usage and costs regularly

## Production Deployment

When deploying to production:

1. Add the environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Upgrade to a paid Twilio account to remove trial limitations
3. Consider implementing additional security measures like CAPTCHA
4. Monitor and set up alerts for unusual usage patterns
