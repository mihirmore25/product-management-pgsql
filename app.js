import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { db } from "./db/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";

const app = express();

db.connect((err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log(
            `Database Connected Successfully On HOST:${res.host} and PORT:${res.port}`
        );
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("view engine", "ejs");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
