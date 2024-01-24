import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const addProduct = (req, res) => {
    const token = req.cookies.access_token;

    console.log("Token --> ", token);

    if (!token)
        return res.status(403).json({
            status: false,
            message: "Not Authorized.",
        });

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err)
            return res.status(403).json({
                status: false,
                message: "Token is not valid.",
            });

        const query = `
            INSERT INTO products (name, description, price, inventory, uid)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;

        const values = [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.inventory,
            userInfo.id,
        ];

        db.query(query, values, (err, data) => {
            if (err) return res.status(500).json(err);

            console.log(data.rows[0]);

            const { id, ...other } = data.rows[0];

            return res.status(201).json({
                status: true,
                message: "Product has been created!",
                data: other,
            });
        });
    });
};
