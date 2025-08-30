import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'OnlyFarmers.in API',
  version: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT, 10) || 3001,
  environment: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // OTP Configuration
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ],
  },

  // Payment Gateway
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  },

  // SMS/OTP Provider
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
    msg91: {
      apiKey: process.env.MSG91_API_KEY,
      senderId: process.env.MSG91_SENDER_ID,
    },
  },

  // AWS Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'onlyfarmers-media',
      cdnUrl: process.env.AWS_S3_CDN_URL,
    },
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // Escrow Configuration
  escrow: {
    depositPercentage: parseFloat(process.env.ESCROW_DEPOSIT_PERCENTAGE) || 10,
    holdDurationHours: parseInt(process.env.ESCROW_HOLD_DURATION_HOURS, 10) || 24,
  },

  // Auction Configuration
  auction: {
    antiSnipingSeconds: parseInt(process.env.AUCTION_ANTI_SNIPING_SECONDS, 10) || 120,
    minBidIncrement: parseFloat(process.env.AUCTION_MIN_BID_INCREMENT) || 1.0,
  },
}));
