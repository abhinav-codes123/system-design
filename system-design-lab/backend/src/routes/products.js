const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// Create product
router.post("/", async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({
                error: "Name, price and stock are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO products (name, price, stock)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, price, stock]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create product"
        });
    }
});

// Get all products
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
});

// Get product by ID
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch product"
        });
    }
});

module.exports = router;