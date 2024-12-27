const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const fileSizeFormatter = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'duzcz6brw', // Replace with your cloud name
    api_key: '244261789276373',
    api_secret: '3fqyXvEfi5gDriGAFzGjmAZLxZ8',
});

const addProduct = asyncHandler(async (req, res) => {
    const { name, price, description, category, isMakeToOrder, preparationDays, quantity } = req.body;

    const sellerId = req.user._id;

    if (!name || !price || !description || !category  ) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const makeToOrder = isMakeToOrder === 'true' ? true : false;

    if (makeToOrder === null) {
        res.status(400);
        throw new Error('You must specify if the product is made to order or not');
    }

    if (makeToOrder && preparationDays === null) {
        res.status(400);
        throw new Error('Preparation days must be specified for a make to order product');
    }

    if (!makeToOrder && quantity === null) {
        res.status(400);
        throw new Error('Quantity must be specified for a product that is not make to order');
    }

    const letter = category.slice(0, 3).toUpperCase();
    const number = Date.now();
    const SKU = letter + "-" + number;

    // Handle image upload
    let fileData = {};

    if (req.image) {
        console.log("image present");
    }

    if (req.file) {
        // Save image to cloudinary
        let uploadedFile;
        console.log(req.file.path);
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path,
                {folder: "dastkaar", resource_type: "image"}
            )
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded " + error);
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            // fileSize: fileSizeFormatter(req.file.size),
        }
    } else {
        res.status(400);
        throw new Error('Please upload an image');
    }

    const image = fileData.filePath;

    const product = new Product({
        name,
        price,
        description,
        category,
        sellerId,
        SKU,
        image,
        makeToOrder,
        preparationDays,
        quantity
    });

    const createdProduct = await product.save();

    res.status(201).json({
        menssage: 'Product added successfully',
        product: { ...createdProduct.toObject(), imageData: fileData }
    });
});

module.exports = { addProduct };