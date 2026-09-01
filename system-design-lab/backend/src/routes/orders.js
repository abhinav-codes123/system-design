const express = require("express");
const pool = require("../db/database");

const router = express.Router();


// Create order
router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const { userId, productId, quantity } = req.body;

        // Basic validation
        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({
                error: "userId, productId and valid quantity are required"
            });
        }

        // Start transaction
        await client.query("BEGIN");


        // 1. Check user
        const userResult = await client.query(
            "SELECT id FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "User not found"
            });
        }


        // 2. Check product and lock its row
        const productResult = await client.query(
            `SELECT id, name, price, stock
             FROM products
             WHERE id = $1
             FOR UPDATE`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Product not found"
            });
        }

        const product = productResult.rows[0];


        // 3. Check stock
        if (product.stock < quantity) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Insufficient stock",
                availableStock: product.stock
            });
        }


        // 4. Calculate total amount
        const amount = Number(product.price) * quantity;


        // 5. Decrease stock
        await client.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2`,
            [quantity, productId]
        );


        // 6. Create order
        const orderResult = await client.query(
            `INSERT INTO orders
             (user_id, product_id, quantity, amount, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, productId, quantity, amount, "created"]
        );


        // Everything successful
        await client.query("COMMIT");


        res.status(201).json({
            message: "Order created successfully",
            order: orderResult.rows[0]
        });

    } catch (error) {

        // Undo all changes if anything fails
        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Failed to create order"
        });

    } finally {

        // Return connection to pool
        client.release();
    }
});


// Get all orders
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM orders
             ORDER BY id`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch orders"
        });
    }
});


// Get order by ID
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch order"
        });
    }
});


module.exports = router;