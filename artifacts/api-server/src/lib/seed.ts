import { db, categoriesTable, productsTable } from "@workspace/db";
import { logger } from "./logger";
import { eq, isNull, and } from "drizzle-orm";

export async function seedIfEmpty() {
  try {
    const existingCategories = await db.select().from(categoriesTable);
    if (existingCategories.length === 0) {
      logger.info("Seeding database...");

      const [shirts, ties, shoes] = await db
        .insert(categoriesTable)
        .values([
          { name: "Shirts", slug: "shirts", isActive: true },
          { name: "Ties", slug: "ties", isActive: true },
          { name: "Shoes", slug: "shoes", isActive: true },
        ])
        .returning();

      await db.insert(productsTable).values([
        { name: "BSL Celtic Tie", description: "A rich teal green tie with intricate Celtic-inspired geometric patterns in gold and yellow. Silk blend, excellent condition.", price: "3500", categoryId: ties.id, imageUrl: "/products/bsl-celtic-1.jpg", sizes: ["One Size"], stock: 1, isFeatured: true, isActive: true, subcategory: "UK" },
        { name: "Christian Dior Monsieur Tie", description: "Classic grey diagonal stripe tie from Christian Dior Monsieur. Timeless elegance in 100% silk.", price: "4500", categoryId: ties.id, imageUrl: "/products/christian-dior-1.jpg", sizes: ["One Size"], stock: 1, isFeatured: true, isActive: true, subcategory: "French" },
        { name: "Burberry Striped Tie", description: "Navy blue Burberry tie with bold red and gold diagonal stripes. Authenticated, immaculate condition.", price: "5500", categoryId: ties.id, imageUrl: "/products/burberry-stripe-1.jpg", sizes: ["One Size"], stock: 2, isFeatured: true, isActive: true, subcategory: "UK" },
        { name: "Burberry Plaid Tie", description: "Deep navy Burberry plaid tie with red and gold accents. The iconic Burberry check in a formal cut.", price: "5000", categoryId: ties.id, imageUrl: "/products/burberry-plaid-1.jpg", sizes: ["One Size"], stock: 1, isFeatured: false, isActive: true, subcategory: "UK" },
        { name: "Polo Ralph Lauren Striped Tie", description: "Polo Ralph Lauren tie in rich maroon with yellow and white diagonal stripes. Classic regimental style.", price: "3500", categoryId: ties.id, imageUrl: "/products/polo-stripe-1.jpg", sizes: ["One Size"], stock: 1, isFeatured: true, isActive: true, subcategory: "USA" },
        { name: "Burberry Check Tie", description: "Authentic Burberry London tie featuring the signature Nova Check in navy and camel. A statement in British heritage.", price: "4800", categoryId: ties.id, imageUrl: "/products/burberry-check-1.jpg", sizes: ["One Size"], stock: 3, isFeatured: false, isActive: true, subcategory: "UK" },
        { name: "Burberry London Rose Check Tie", description: "Burberry London silk tie in dusty rose with the signature Nova Check in gold and navy.", price: "4800", categoryId: ties.id, imageUrl: "/products/burberry-rose-full.jpg", sizes: ["One Size"], stock: 3, isFeatured: true, isActive: true, subcategory: "UK" },
        { name: "Bold Maroon Gold Stripe Tie", description: "Striking silk tie with bold maroon and gold diagonal stripes. Classic regimental style with rich, saturated color.", price: "2500", categoryId: ties.id, imageUrl: "/products/maroon-gold-full.jpg", sizes: ["One Size"], stock: 4, isFeatured: true, isActive: true, subcategory: "Italian" },
        { name: "Copper Polka Dot Tie", description: "Elegant copper silk tie with evenly spaced navy polka dots. A timeless gentleman's pattern in warm, rich tones.", price: "2800", categoryId: ties.id, imageUrl: "/products/copper-dot-full.jpg", sizes: ["One Size"], stock: 2, isFeatured: true, isActive: true, subcategory: "Italian" },
        { name: "Ralph Lauren White Oxford Shirt", description: "Crisp white oxford-weave dress shirt by Ralph Lauren. Button-down collar, single cuff.", price: "3200", categoryId: shirts.id, imageUrl: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&fit=crop&auto=format", sizes: ["S", "M", "L", "XL"], stock: 5, isFeatured: true, isActive: true, subcategory: "USA" },
        { name: "Van Heusen Light Blue Formal Shirt", description: "Classic light blue formal shirt in a fine poplin weave. Spread collar, slim fit.", price: "2200", categoryId: shirts.id, imageUrl: "https://images.unsplash.com/photo-1607081692251-0e04a8c6e4ed?w=600&fit=crop&auto=format", sizes: ["S", "M", "L", "XL", "XXL"], stock: 7, isFeatured: false, isActive: true, subcategory: "USA" },
        { name: "Arrow Striped Formal Shirt", description: "Navy and white fine-stripe formal shirt. Semi-spread collar, boardroom-ready.", price: "1800", categoryId: shirts.id, imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&fit=crop&auto=format", sizes: ["M", "L", "XL"], stock: 4, isFeatured: true, isActive: true, subcategory: "USA" },
        { name: "Gant Plain White Dress Shirt", description: "A pure white dress shirt from Gant. Poplin fabric, classic fit, mother-of-pearl buttons.", price: "2800", categoryId: shirts.id, imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&fit=crop&auto=format", sizes: ["S", "M", "L"], stock: 3, isFeatured: false, isActive: true, subcategory: "UK" },
        { name: "Clarks Brown Cap-Toe Oxford", description: "Timeless brown cap-toe oxford in smooth leather. Goodyear welt construction. Pairs flawlessly with formal trousers.", price: "8500", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&fit=crop&auto=format", sizes: ["39", "40", "41", "42", "43", "44"], stock: 3, isFeatured: true, isActive: true, subcategory: "Formals" },
        { name: "Bata Black Derby Shoes", description: "Classic black derby in polished leather. Wide toe box for all-day comfort without sacrificing formal appeal.", price: "5500", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&fit=crop&auto=format", sizes: ["40", "41", "42", "43", "44"], stock: 6, isFeatured: false, isActive: true, subcategory: "Formals" },
        { name: "Red Tape Tan Loafers", description: "Sophisticated tan penny loafers in smooth calf leather. Slip-on convenience meets formal versatility.", price: "6200", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1553545204-4f7d339aa06a?w=600&fit=crop&auto=format", sizes: ["39", "40", "41", "42", "43"], stock: 4, isFeatured: true, isActive: true, subcategory: "Formals" },
        { name: "Hush Puppies Formal Brogue", description: "Wingtip brogue in rich tan leather with intricate perforations. Bridges formal and smart-casual.", price: "7000", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&fit=crop&auto=format", sizes: ["40", "41", "42", "43", "44"], stock: 2, isFeatured: false, isActive: true, subcategory: "Formals" },
        { name: "Nike Air Max Sneakers", description: "Clean white Nike Air Max in excellent pre-owned condition. Iconic silhouette, comfortable cushioning, minimal wear.", price: "9500", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop&auto=format", sizes: ["40", "41", "42", "43", "44", "45"], stock: 3, isFeatured: true, isActive: true, subcategory: "Sneakers" },
        { name: "Adidas Superstar Sneakers", description: "The legendary Adidas Superstar in classic white with black shell toe. A street icon in near-perfect condition.", price: "8000", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1508782600359-7e861b49a0a3?w=600&fit=crop&auto=format", sizes: ["39", "40", "41", "42", "43", "44"], stock: 4, isFeatured: false, isActive: true, subcategory: "Sneakers" },
        { name: "Puma RS-X Joggers", description: "Bold Puma RS-X running-inspired sneakers with chunky sole and retro colourway. Lightweight and flexible.", price: "7500", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&fit=crop&auto=format", sizes: ["40", "41", "42", "43", "44"], stock: 5, isFeatured: true, isActive: true, subcategory: "Joggers" },
        { name: "New Balance 990 Joggers", description: "New Balance 990 in grey suede and mesh. American-made quality, cushioned for long runs or all-day wear.", price: "11000", categoryId: shoes.id, imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&fit=crop&auto=format", sizes: ["40", "41", "42", "43", "44", "45"], stock: 2, isFeatured: false, isActive: true, subcategory: "Joggers" },
      ]);

      logger.info("Database seeded successfully.");
    }

    await migrateSubcategories();
    await migrateTieSizes();
  } catch (err) {
    logger.error({ err }, "Failed to seed database");
  }
}

async function migrateSubcategories() {
  try {
    const untagged = await db.select().from(productsTable).where(isNull(productsTable.subcategory));
    if (untagged.length === 0) return;

    const nameMap: Record<string, string> = {
      "BSL Celtic Tie": "UK",
      "Christian Dior Monsieur Tie": "French",
      "Burberry Striped Tie": "UK",
      "Burberry Plaid Tie": "UK",
      "Polo Ralph Lauren Striped Tie": "USA",
      "Burberry Check Tie": "UK",
      "Burberry London Rose Check Tie": "UK",
      "Bold Maroon Gold Stripe Tie": "Italian",
      "Copper Polka Dot Tie": "Italian",
      "Ralph Lauren White Oxford Shirt": "USA",
      "Van Heusen Light Blue Formal Shirt": "USA",
      "Arrow Striped Formal Shirt": "USA",
      "Gant Plain White Dress Shirt": "UK",
      "Clarks Brown Cap-Toe Oxford": "Formals",
      "Bata Black Derby Shoes": "Formals",
      "Red Tape Tan Loafers": "Formals",
      "Hush Puppies Formal Brogue": "Formals",
      "Nike Air Max Sneakers": "Sneakers",
      "Adidas Superstar Sneakers": "Sneakers",
      "Puma RS-X Joggers": "Joggers",
      "New Balance 990 Joggers": "Joggers",
    };

    for (const product of untagged) {
      const sub = nameMap[product.name];
      if (sub) {
        await db.update(productsTable).set({ subcategory: sub }).where(eq(productsTable.id, product.id));
      }
    }

    logger.info(`Migrated subcategories for ${untagged.length} products.`);
  } catch (err) {
    logger.error({ err }, "Failed to migrate subcategories");
  }
}

const TIE_SIZES = ["Regular (57–58\")", "Short (55–56\")", "Long / XL (59–63\")", "Extra Long / XXL (64–67\")"];

async function migrateTieSizes() {
  try {
    const [tiesCategory] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "ties")).limit(1);
    if (!tiesCategory) return;

    const ties = await db.select().from(productsTable).where(eq(productsTable.categoryId, tiesCategory.id));

    for (const tie of ties) {
      if (tie.sizes.length === 1 && tie.sizes[0] === "One Size") {
        await db.update(productsTable).set({ sizes: TIE_SIZES }).where(eq(productsTable.id, tie.id));
      }
    }
    logger.info("Migrated tie sizes.");
  } catch (err) {
    logger.error({ err }, "Failed to migrate tie sizes");
  }
}
