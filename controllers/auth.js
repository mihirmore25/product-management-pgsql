import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getRegister = (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const register = (req, res) => {
    // console.log(req.body);

    // CHECK EXISTING USER
    const query = "SELECT * FROM users WHERE username = $1 OR email = $2";

    const filter = [req.body.username, req.body.email];

    db.query(query, filter, (err, data) => {
        if (err) return res.json(err);

        // console.log(data.rows);

        // if (data.rowCount) return res.status(409).json("User already exist!");
        if (data.rowCount)
            return res.status(409).render("error", {
                error: res.statusCode,
                message: "User Already Exist! Please try logging in.",
            });

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

export const getLogin = (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const login = (req, res) => {
    // CHECK USER

    const query = "SELECT * FROM users WHERE username = $1";
    const filter = [req.body.username];

    db.query(query, filter, (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.rowCount === 0) {
            return res.status(404).render("error", {
                error: res.statusCode,
                message: "User Not Found! Try Registering New User.",
            });
        }

        // CHECK PASSWORD
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            data.rows[0].password
        );

        if (!isPasswordCorrect)
            return res
                .status(400)
                .render("error", {
                    error: res.statusCode,
                    message: "Wrong Username or Password.",
                });

        const token = jwt.sign({ id: data.rows[0].id }, process.env.JWT_SECRET);

        const { password, ...other } = data.rows[0];

        // res.cookie("access_token", token, {
        //     httpOnly: true,
        // })
        //     .status(200)
        //     .json({
        //         status: true,
        //         message: "User Logged In Successfully.",
        //         data: other,
        //     });
        res.cookie("access_token", token, { httpOnly: true })
            .status(200)
            .redirect("/api/v1/products");
    });
};

export const logout = (req, res) => {
    // console.log("Cookie --> ", res);

    // res.clearCookie("access_token", {
    //     sameSite: "none",
    //     secure: true,
    // })
    //     .status(200)
    //     .json({
    //         status: true,
    //         message: "User has been logged out successfully.",
    //     });
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true,
    })
        .status(200)
        .redirect("/api/v1/auth/login");
};
