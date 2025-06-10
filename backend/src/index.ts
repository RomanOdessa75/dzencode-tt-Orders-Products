import express, { Express, Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import http from "http";
import { Server as IOServer } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: [
      "https://dzencode-tt-orders-products.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend Server is running!");
});

app.get("/api/orders", authMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            guarantee: true,
            prices: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, orderDate } = req.body;
    if (!title || typeof title !== "string" || title.length < 2) {
      res.status(400).json({ error: "Order title is required (min 2 chars)" });
      return;
    }
    const order = await prisma.order.create({
      data: {
        title,
        description,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
      },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.delete(
  "/api/orders/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await prisma.order.delete({ where: { id } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  }
);

app.get(
  "/api/products",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const where = type ? { type: String(type) } : {};
      const products = await prisma.product.findMany({
        where,
        include: {
          guarantee: true,
          prices: true,
          order: true,
        },
        orderBy: { id: "desc" },
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

app.post(
  "/api/products",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        serialNumber,
        isNew,
        photo,
        title,
        type,
        specification,
        orderId,
        productDate,
        guarantee,
        prices,
      } = req.body;
      if (!title || typeof title !== "string" || title.length < 2) {
        res
          .status(400)
          .json({ error: "Product title is required (min 2 chars)" });
        return;
      }
      if (!type || typeof type !== "string" || type.length < 2) {
        res
          .status(400)
          .json({ error: "Product type is required (min 2 chars)" });
        return;
      }
      const product = await prisma.product.create({
        data: {
          serialNumber,
          isNew,
          photo,
          title,
          type,
          specification,
          orderId,
          productDate: productDate ? new Date(productDate) : new Date(),
          guarantee: guarantee
            ? {
                create: {
                  startDate: new Date(guarantee.startDate),
                  endDate: new Date(guarantee.endDate),
                },
              }
            : undefined,
          prices:
            prices && prices.length
              ? {
                  create: prices.map((p: any) => ({
                    value: p.value,
                    symbol: p.symbol,
                    isDefault: !!p.isDefault,
                  })),
                }
              : undefined,
        },
        include: {
          guarantee: true,
          prices: true,
          order: true,
        },
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

app.delete(
  "/api/products/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await prisma.product.delete({ where: { id } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

const registerHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password_hash } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};
app.post("/api/auth/register", registerHandler);

const loginHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
app.post("/api/auth/login", loginHandler);

function authMiddleware(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

let activeConnections = 0;

io.on("connection", (socket) => {
  activeConnections++;
  io.emit("active_connections", { count: activeConnections });

  socket.on("disconnect", () => {
    activeConnections--;
    io.emit("active_connections", { count: activeConnections });
  });
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully!");

    server.listen(port, () => {
      console.log(`Backend server is running at http://localhost:${port}`);
      console.log(`Socket.IO server is running on the same port.`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

main();

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
