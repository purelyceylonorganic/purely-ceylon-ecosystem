const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing Environment Variable: ${key}`);
  }
});

export {};