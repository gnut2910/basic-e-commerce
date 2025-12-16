import express from "express";
import bodyParser from "body-parser";
import productRouter from "./routes/product.route.js";
import categoryRouter from "./routes/category.route.js";
import cartRouter from "./routes/cart.route.js";
import storeRouter from "./routes/store.route.js";
import orderRouter from "./routes/order.route.js";
import orderItemRouter from "./routes/order_item.route.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import paymentRouter from "./routes/payment.route.js";
import dashBoardRouter from "./routes/dashboard.route.js";
import storeOrderRouter from "./routes/store_order.route.js"; // Router cho store_order
import reviewRouter from "./routes/review.route.js";

const app = express();

app.use(
  cors({
    origin: "https://basic-e-commerce-nine.vercel.app",
    credentials: true,
  })
);
// noi dung phan body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Cấu hình __dirname trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cho phép truy cập tĩnh tới thư mục "public"
app.use("/public", express.static(path.join(__dirname, "public")));

// // Cho phép truy cập ảnh tĩnh
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/carts", cartRouter);
app.use("/stores", storeRouter);
app.use("/orders", orderRouter);
app.use("/order-items", orderItemRouter);
app.use("/api/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/payment", paymentRouter);
app.use("/dashboard", dashBoardRouter);
app.use("/store-orders", storeOrderRouter);
app.use("/reviews", reviewRouter);

export default app;
