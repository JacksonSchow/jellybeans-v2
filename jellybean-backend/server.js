// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const AWS = require('aws-sdk');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
require('dotenv').config();

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to the database');
    release();
});

// S3 setup
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-2',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImageToS3 = async (file) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Key; // Return the S3 file key (filename)
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Image upload failed');
    }
};

// Index, GET all Jellybeans
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jellybeans_jellybeanflavor');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query to retrieve all flavors failed.' });
      }
});

// POST - Add jellybean flavor
app.post('/api/jellybeans', upload.single('imageFile'), async (req, res) => {
    const { flavor } = req.body;
    let imageKey = 'no-image-available.jpeg';

    if (req.file) {
        try {
            imageKey = await uploadImageToS3(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    try {
        const result = await pool.query(
            'INSERT INTO jellybeans_jellybeanflavor (flavor, s3_image, date_added) VALUES ($1, $2, NOW()) RETURNING *',
            [flavor, imageKey]
        );
        res.status(201).json({ message: 'Flavor added', newFlavor: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add flavor to the database' });
    }
});

// PUT - Update flavor name and/or image
app.put('/api/jellybeans/:id', upload.single('imageFile'), async (req, res) => {
    const { id } = req.params;
    const { flavor } = req.body;

    try {
        const existingFlavorResult = await pool.query('SELECT * FROM jellybeans_jellybeanflavor WHERE id = $1', [id]);
        const existingFlavor = existingFlavorResult.rows[0];

        if (!existingFlavor) {
            return res.status(404).json({ error: 'Flavor not found' });
        }

        let imageKey = existingFlavor.s3_image;
        if (req.file) {
            try {
                imageKey = await uploadImageToS3(req.file);
            } catch (error) {
                return res.status(500).json({ error: 'Failed to upload new image' });
            }
        }

        const result = await pool.query(
            'UPDATE jellybeans_jellybeanflavor SET flavor = $1, s3_image = $2 WHERE id = $3 RETURNING *',
            [flavor, imageKey, id]
        );
        res.status(200).json({ message: 'Flavor updated', updatedFlavor: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update flavor in the database' });
    }
});

// DELETE - Delete a flavor and its associated image from S3
app.delete('/api/jellybeans/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
        // Retrieve flavor from database
        const existingFlavorResult = await pool.query('SELECT * FROM jellybeans_jellybeanflavor WHERE id = $1', [id]);
        const existingFlavor = existingFlavorResult.rows[0];
        
        if (!existingFlavor) {
            return res.status(404).json({ error: 'Flavor not found' });
        }

        const imageKey = existingFlavor.s3_image;

        // Delete image from S3 (unless image is default 'No Image Available')
        if (imageKey && imageKey !== 'no-image-available.jpeg') {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: imageKey
            };
            try {
                await s3.deleteObject(params).promise();
                console.log(`Image ${imageKey} deleted from S3`);
            } catch (error) {
                console.error('Error deleting image from S3:', error);
                return res.status(500).json({ error: 'Failed to delete image from S3' });
            }
        }

        // Delete record from database
        const deleteResult = await pool.query('DELETE FROM jellybeans_jellybeanflavor WHERE id = $1 RETURNING *', [id]);

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: 'Flavor not found' });
        }

        res.status(200).json({ message: 'Flavor and associated image deleted' });
    } catch (error) {
        console.error('Error deleting flavor and image:', error);
        res.status(500).json({ error: 'Failed to delete flavor and image' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
