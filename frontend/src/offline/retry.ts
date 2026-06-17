export const shouldRetry = (retries: number) => {
  return retries < 3;
};