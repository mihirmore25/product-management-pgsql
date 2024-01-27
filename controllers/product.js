import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getAddProduct = (req, res) => {
    try {
        res.render("addProduct");
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const addProduct = (req, res) => {
    const token = req.cookies.access_token;

    console.log("Token --> ", token);

    if (!token)
        return res.status(403).render("error", {
            error: res.statusCode,
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

            // return res.status(201).json({
            //     status: true,
            //     message: "Product has been created!",
            //     data: other,
            // });

            res.status(201).redirect("/api/v1/products");
        });
    });
};

export const getProducts = (req, res) => {
    const token = req.cookies.access_token;

    if (!token)
        return res.status(403).render("error", {
            error: res.statusCode,
            message: "Not authorized",
        });

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err)
            return res
                .status(403)
                .json({ status: false, message: "Token is not valid!" });

        const query =
            "SELECT id, name, description, price, inventory, uid FROM products";

        db.query(query, [], (err, data) => {
            if (err) return res.status(500).json(err);

            if (data.rowCount === 0)
                return res.status(404).render("error", {
                    error: res.statusCode,
                    message: "Products Not Found! Try Creating New Product.",
                });
            // return res.status(404).json({
            //     status: false,
            //     message: "Products Not Found!",
            // });

            // return res.status(200).json({
            //     status: true,
            //     data: data.rows,
            // });

            console.log("Products --> ", data.rows);

            res.status(200).render("products", {
                products: data.rows,
                user: userInfo.id,
            });
        });
    });
};

export const getProduct = (req, res) => {
    // GET A SINGLE PRODUCT

    const query = `
        SELECT 
            name, description, price, inventory, u.id, username, email
        FROM products as p
        JOIN users as u ON p.uid = u.id  
        WHERE p.id = $1       
    `;

    db.query(query, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);

        if (req.params.id && data.rowCount === 0) {
            return res.status(404).render("error", {
                error: res.statusCode,
                message: "Product Not Found",
            });
        }

        // return res.status(200).json({
        //     status: true,
        //     data: data.rows[0],
        // });
        res.status(200).render("product", { product: data.rows[0] });
    });
};

export const getUpdateProduct = (req, res) => {
    const token = req.cookies.access_token;

    const productId = req.params.id;
    console.log(productId);

    if (!token) {
        return res
            .status(403)
            .render("error", {
                error: res.statusCode,
                message: "Not authorized",
            });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res
                .status(403)
                .json({ status: false, message: "Token is not valid!" });
        }

        const query = "SELECT * FROM products WHERE id = $1 AND uid = $2";

        console.log("UserInfo Id : ", userInfo.id);

        db.query(query, [productId, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err);

            console.log(data.rows[0]);

            const { uid, ...other } = data.rows[0];

            return res
                .status(200)
                .render("updateProduct", { product: data.rows[0] });

            // return res.status(403).json({
            //     status: false,
            //     message: "You can only update your own product.",
            // });
        });
    });
};

export const updateProduct = (req, res) => {
    const token = req.cookies.access_token;

    const productId = req.params.id;
    console.log(productId);

    if (!token) {
        return res.status(403).render("error", {
            error: res.statusCode,
            message: "Not authorized",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).render("error", {
                error: res.statusCode,
                message: "Token is not valid!",
            });
        }

        const query = `UPDATE products 
                SET name = $1, description = $2, price = $3, inventory = $4
                WHERE id = $5 AND uid = $6 RETURNING *
            `;

        const values = [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.inventory,
            productId,
            userInfo.id,
        ];

        db.query(query, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }

            console.log(data.rows[0]);

            const { id, uid, ...other } = data.rows[0];
            // return res.status(200).json({
            //     status: true,
            //     message: "Product has been updated!",
            //     data: other,,
            // });

            console.log("UID --> ", uid);
            console.log("Other --> ", other);
            console.log("UserInfo Id --> ", userInfo.id);

            return res.status(200).redirect("/api/v1/products");
        });
    });
};

export const deleteProduct = (req, res) => {
    const token = req.cookies.access_token;

    if (!token)
        return res
            .status(401)
            .json({ status: false, message: "Not authenticated" });

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err)
            return res
                .status(403)
                .json({ status: false, message: "Token is not valid!" });

        const productId = req.params.id;

        const query =
            "DELETE FROM products WHERE id = $1 AND uid = $2 RETURNING *";

        db.query(query, [productId, userInfo.id], (err, data) => {
            if (err)
                return res.status(403).json({
                    status: false,
                    message: "You can only delete your own post",
                });

            const { id, ...other } = data.rows[0];

            // return res.status(200).json({
            //     status: true,
            //     message: "Product has been deleted!",
            //     data: other,
            // });

            res.status(200).redirect("/api/v1/products");
        });
    });
};
