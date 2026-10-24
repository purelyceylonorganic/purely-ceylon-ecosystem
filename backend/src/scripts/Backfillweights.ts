import { prisma } from "../config/prisma";

// ======================================================
// ⚖️ பழைய "250g", "1kg" போன்ற எழுத்து எடைகளை எண் கிராமாக (weightGrams) மாற்றும்.
//
// பாதுகாப்பு சோதனை (எதையும் மாற்றாது):   npx ts-node src/scripts/backfillWeights.ts
// உண்மையில் சேமிக்க:                      npx ts-node src/scripts/backfillWeights.ts --apply
// பொட்டலத்தின் எடையைச் சேர்க்க (எ.கா. +50g): ... --apply --packaging=50
// ======================================================

function parseGrams(text: string): number | null {
  const match = text
    .toLowerCase()
    .replace(/,/g, "")
    .match(/(\d+(?:\.\d+)?)\s*(kilograms?|kilos?|kgs?|grams?|gms?|g)\b/);

  if (!match) return null;

  const value = Number(match[1]);
  const isKg = match[2].startsWith("k");

  return Math.round(isKg ? value * 1000 : value);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const packagingArg = process.argv.find((a) => a.startsWith("--packaging="));
  const packaging = packagingArg ? Number(packagingArg.split("=")[1]) || 0 : 0;

  const variants = await prisma.productVariant.findMany({
    where: { weightGrams: 0 },
    select: { id: true, sku: true, weight: true, product: { select: { name: true } } },
  });

  console.log(`எடை இல்லாத variants: ${variants.length} (packaging +${packaging}g)\n`);

  let updated = 0;
  const unparsed: string[] = [];

  for (const variant of variants) {
    const grams = parseGrams(variant.weight);
    const label = `${variant.product.name} • ${variant.sku} • "${variant.weight}"`;

    if (grams === null) {
      unparsed.push(label);
      continue;
    }

    const total = grams + packaging;
    console.log(`${apply ? "✔" : "•"} ${label}  →  ${total} g`);

    if (apply) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { weightGrams: total },
      });
    }
    updated++;
  }

  console.log(`\n${apply ? "புதுப்பிக்கப்பட்டவை" : "புதுப்பிக்கக்கூடியவை"}: ${updated}`);

  if (unparsed.length > 0) {
    console.log(`\n⚠️ புரிந்துகொள்ள முடியாதவை (Admin → Edit Product-ல் கையால் உள்ளிடவும்): ${unparsed.length}`);
    unparsed.forEach((line) => console.log("  - " + line));
  }

  if (!apply) {
    console.log("\nஇது சோதனை மட்டும். சேமிக்க --apply சேர்த்து மீண்டும் இயக்குங்கள்.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());