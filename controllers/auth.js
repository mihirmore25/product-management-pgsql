import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    // console.log(req.body);

    // CHECK EXISTING USER
    const query = "SELECT * FROM users WHERE username = $1 OR email = $2";

    const filter = [req.body.username, req.body.email];

    db.query(query, filter, (err, data) => {
        if (err) return res.json(err);

        // console.log(data.rows);

        if (data.rowCount) return res.status(409).json("User already exist!");

        // Hash the password and create a user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // INSERT A NEW USER INTO THE DATABASE
        const insertQuery =
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";

        const values = [req.body.username, req.body.email, hash];

        db.query(insertQuery, values, (err, data) => {
            if (err) return res.status(500).json(err);

            console.log("Created User --> ", data.rows);

            return res.status(201).json({
                status: true,
                message: "User has been created successfully.",
                user: {
                    username: data.rows[0].username,
                    email: data.rows[0].email,
                },
            });
        });
    });
};
