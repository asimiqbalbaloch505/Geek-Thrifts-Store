router.post("/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Automatically make your specific email an admin upon registration
    const isAdminEmail = cleanEmail === "asimiqbalbaloch505@gmail.com";
    const assignedRole = isAdminEmail ? "admin" : "customer";

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
      })
      .returning();

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to signup");
    res.status(500).json({ error: "Internal server error" });
  }
});