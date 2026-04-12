import { db, categoriesTable, productsTable } from "@workspace/db";
import { logger } from "./logger";

export async function seedIfEmpty() {
  try {
    const existingCategories = await db.select().from(categoriesTable);
    if (existingCategories.length > 0) {
      logger.info("Database already seeded, skipping.");
      return;
    }

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
      {
        name: "BSL Celtic Tie",
        description: "A rich teal green tie with intricate Celtic-inspired geometric patterns in gold and yellow. Silk blend, excellent condition.",
        price: "3500",
        categoryId: ties.id,
        imageUrl: "/products/bsl-celtic-1.jpg",
        sizes: ["One Size"],
        stock: 1,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Christian Dior Monsieur Tie",
        description: "Classic grey diagonal stripe tie from Christian Dior Monsieur. Timeless elegance in 100% silk.",
        price: "4500",
        categoryId: ties.id,
        imageUrl: "/products/christian-dior-1.jpg",
        sizes: ["One Size"],
        stock: 1,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Burberry Striped Tie",
        description: "Navy blue Burberry tie with bold red and gold diagonal stripes. Authenticated, immaculate condition.",
        price: "5500",
        categoryId: ties.id,
        imageUrl: "/products/burberry-stripe-1.jpg",
        sizes: ["One Size"],
        stock: 2,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Burberry Plaid Tie",
        description: "Deep navy Burberry plaid tie with red and gold accents. The iconic Burberry check in a formal cut.",
        price: "5000",
        categoryId: ties.id,
        imageUrl: "/products/burberry-plaid-1.jpg",
        sizes: ["One Size"],
        stock: 1,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Polo Ralph Lauren Striped Tie",
        description: "Polo Ralph Lauren tie in rich maroon with yellow and white diagonal stripes. Classic regimental style.",
        price: "3500",
        categoryId: ties.id,
        imageUrl: "/products/polo-stripe-1.jpg",
        sizes: ["One Size"],
        stock: 1,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Burberry Check Tie",
        description: "Authentic Burberry London tie featuring the signature Nova Check in navy and camel. A statement in British heritage.",
        price: "4800",
        categoryId: ties.id,
        imageUrl: "/products/burberry-check-1.jpg",
        sizes: ["One Size"],
        stock: 3,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Burberry London Rose Check Tie",
        description: "Burberry London silk tie in dusty rose with the signature Nova Check in gold and navy. Rich texture, unmistakable pattern.",
        price: "4800",
        categoryId: ties.id,
        imageUrl: "/products/burberry-rose-full.jpg",
        sizes: ["One Size"],
        stock: 3,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Bold Maroon Gold Stripe Tie",
        description: "Striking silk tie with bold maroon and gold diagonal stripes. Classic regimental style with rich, saturated color.",
        price: "2500",
        categoryId: ties.id,
        imageUrl: "/products/maroon-gold-full.jpg",
        sizes: ["One Size"],
        stock: 4,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Copper Polka Dot Tie",
        description: "Elegant copper silk tie with evenly spaced navy polka dots. A timeless gentleman's pattern in warm, rich tones.",
        price: "2800",
        categoryId: ties.id,
        imageUrl: "/products/copper-dot-full.jpg",
        sizes: ["One Size"],
        stock: 2,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Ralph Lauren White Oxford Shirt",
        description: "Crisp white oxford-weave dress shirt by Ralph Lauren. Button-down collar, single cuff. Perfect for formal and business wear.",
        price: "3200",
        categoryId: shirts.id,
        imageUrl: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&fit=crop&auto=format",
        sizes: ["S", "M", "L", "XL"],
        stock: 5,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Van Heusen Light Blue Formal Shirt",
        description: "Classic light blue formal shirt in a fine poplin weave. Spread collar, slim fit. A wardrobe staple for every professional.",
        price: "2200",
        categoryId: shirts.id,
        imageUrl: "https://images.unsplash.com/photo-1607081692251-0e04a8c6e4ed?w=600&fit=crop&auto=format",
        sizes: ["S", "M", "L", "XL", "XXL"],
        stock: 7,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Arrow Striped Formal Shirt",
        description: "Navy and white fine-stripe formal shirt. Semi-spread collar and a clean silhouette make this a boardroom-ready essential.",
        price: "1800",
        categoryId: shirts.id,
        imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&fit=crop&auto=format",
        sizes: ["M", "L", "XL"],
        stock: 4,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Gant Plain White Dress Shirt",
        description: "A pure white dress shirt from Gant. Poplin fabric, classic fit, mother-of-pearl buttons. Ideal with a suit or blazer.",
        price: "2800",
        categoryId: shirts.id,
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&fit=crop&auto=format",
        sizes: ["S", "M", "L"],
        stock: 3,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Clarks Brown Cap-Toe Oxford",
        description: "Timeless brown cap-toe oxford in smooth leather. Goodyear welt construction. Pairs flawlessly with formal trousers.",
        price: "8500",
        categoryId: shoes.id,
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&fit=crop&auto=format",
        sizes: ["39", "40", "41", "42", "43", "44"],
        stock: 3,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Bata Black Derby Shoes",
        description: "Classic black derby in polished leather. Wide toe box for all-day comfort without sacrificing formal appeal.",
        price: "5500",
        categoryId: shoes.id,
        imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&fit=crop&auto=format",
        sizes: ["40", "41", "42", "43", "44"],
        stock: 6,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Red Tape Tan Loafers",
        description: "Sophisticated tan penny loafers in smooth calf leather. Slip-on convenience meets formal versatility.",
        price: "6200",
        categoryId: shoes.id,
        imageUrl: "https://images.unsplash.com/photo-1553545204-4f7d339aa06a?w=600&fit=crop&auto=format",
        sizes: ["39", "40", "41", "42", "43"],
        stock: 4,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Hush Puppies Formal Brogue",
        description: "Wingtip brogue in rich tan leather with intricate perforations. A sophisticated choice that bridges formal and smart-casual.",
        price: "7000",
        categoryId: shoes.id,
        imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&fit=crop&auto=format",
        sizes: ["40", "41", "42", "43", "44"],
        stock: 2,
        isFeatured: false,
        isActive: true,
      },
    ]);

    logger.info("Database seeded successfully with categories and products.");
  } catch (err) {
    logger.error({ err }, "Failed to seed database");
  }
}
