const MAX_RETRIES = 3;

export const shouldRetry = (retries: number) => {
  return retries < MAX_RETRIES;
};

export const getRetryDelay = (retries: number) => {
  const delays = [
    5000,
    15000,
    30000,
  ];

  return delays[Math.min(retries, delays.length - 1)];
};