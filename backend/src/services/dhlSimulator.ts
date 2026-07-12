export const generateTrackingId = () => {
  return "DHL" + Math.floor(100000000 + Math.random() * 900000000);
};