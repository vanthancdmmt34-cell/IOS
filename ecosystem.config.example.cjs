// Sample PM2 configuration. Copy to ecosystem.config.cjs (DO NOT commit files with real secrets), edit values, then:
//   chmod 600 ecosystem.config.cjs && pm2 start ecosystem.config.cjs && pm2 save
// Full list of environment variables: docs/ENVIRONMENT_VARIABLES.md
module.exports = {
  apps: [{
    name: "hoc-ngoai-ngu",
    script: "server.js",
    cwd: __dirname,
    instances: 1,
    env: {
      PORT: "8082",
      HOST: "127.0.0.1",
      TZ: "Asia/Ho_Chi_Minh",
      PUBLIC_URL: "https://study.liferivo.com",
      // SePay payment: fill in ONE of the two
      SEPAY_WEBHOOK_SECRET: "",
      SEPAY_API_KEY: "",
      // AI Tutor
      GEMINI_API_KEY: "",
      AI_MODEL: "gemini-3.1-flash-lite",
      AI_PRICE_INPUT_PER_M: "0.25",
      AI_PRICE_OUTPUT_PER_M: "1.5",
      AI_MONTHLY_BUDGET_USD: "10",
      // Email OTP for "forgot password" (leave SMTP_HOST empty to keep it off)
      SMTP_HOST: "",
      SMTP_PORT: "465",
      SMTP_USER: "",
      SMTP_PASS: "",
      SMTP_FROM: "",
      SMTP_FROM_NAME: "LifeRivo",
    },
    max_memory_restart: "600M",
  }],
};
