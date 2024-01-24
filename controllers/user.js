import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const addUser = (req, res) => {
    const token = req.cookies.access_token;
    console.log("Token --> ", token);

    console.log("Body --> ", req.body);

    if (!token)
        return res.status(403).json({
            status: false,
            message: "Not Authorized.",
        });

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err)
            return res
                .status(403)
                .json({ status: false, message: "Token is not valid!" });

        console.log("User Info --> ", userInfo);

        if (userInfo.id === 1) {
            const query = `
                INSERT INTO users (username, email, password)
                VALUES ($1, $2, $3) RETURNING *
            `;

            // HASH THE PASSWORD AND ADD A USER
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            const values = [req.body.username, req.body.email, hash];

            db.query(query, values, (err, data) => {
                if (err) return res.status(500).json(err);

                console.log(data.rows[0]);

                const { password, id, ...other } = data.rows[0];

                return res.status(200).json({
                    status: true,
                    message: "User has been created successfully!",
                    data: other,
                });
            });
        } else {
            return res
                .status(403)
                .json({ status: false, message: "Only admin could add user!" });
        }
    });
};

export const getUsers = (req, res) => {
    const query = "SELECT username, email FROM users";

    db.query(query, [], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.rowCount === 0) {
            return res.status(404).json({
                status: false,
                message: "Users Not Found!",
            });
        }

        return res.status(200).json({
            status: true,
            data: data.rows,
        });
    });
};

export const getUser = (req, res) => {
    console.log(req.params.id);
    const userId = req.params.id;

    const query = `
        SELECT username, email FROM users
        WHERE id = $1
    `;

    db.query(query, [userId], (err, data) => {
        if (err) return res.status(500).json(err);

        if (userId && data.rowCount === 0) {
            return res
                .status(404)
                .json({ status: false, message: "User Not Found" });
        }

        const { password, id, ...other } = data.rows[0];

        return res.status(200).json({
            status: true,
            data: other,
        });
    });
};
