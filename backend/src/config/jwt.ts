// 🔐 JWT ரகசியம் — ஒரே இடத்தில்.
// Environment-ல் JWT_SECRET இல்லையென்றால் server தொடங்காது;
// code-ல் எழுதப்பட்ட "இயல்புநிலை" ரகசியம் எதுவும் இல்லை.
const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV !== "test") {
  throw new Error("Missing Environment Variable: JWT_SECRET");
}

export const JWT_SECRET: string = secret || "test-only-secret";