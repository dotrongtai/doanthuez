export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    apiPrefix: process.env.API_PREFIX ?? '/api/v1',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 7),
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    s3Bucket: process.env.S3_BUCKET,
    cloudFrontUrl: process.env.CLOUDFRONT_URL,
  },
  // Feature 83/86/87 (docs/features/sprint4/13_ai_chatbot.md) — free,
  // open-weight model via Groq's OpenAI-compatible chat completions API.
  ai: {
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  },
});
