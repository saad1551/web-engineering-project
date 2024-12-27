const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const fileSizeFormatter = require('../utils/fileUpload');
const { get } = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('../models/categoryModel');
const CategoryGroup = require('../models/categoryGroupModel');

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

    // check if the same seller has already listed a product with the same name
    const productExists = await Product.findOne({ name, sellerId });

    if (productExists) {
        res.status(400);
        throw new Error('You have already listed a product with the same name');
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

// get all products, most recently added first
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({ products });
});

const createCategories = asyncHandler(async (req, res) => {
    const data = [
        {
            name: 'Handicrafts',
            nameUrdu: 'ہنر مندی',
            description: 'A collection of handcrafted items from rural areas.',
            descriptionUrdu: 'دیہی علاقوں سے ہنر مندی کی اشیاء کا مجموعہ.',
            categories: [
                { name: 'Embroidered Textiles', nameUrdu: 'کڑھائی شدہ کپڑے', description: 'Beautifully embroidered table runners, cushion covers, and more.', descriptionUrdu: 'خوبصورت کڑھائی والے ٹیبل رنرز، کشن کور، اور مزید.' },
                { name: 'Handwoven Rugs and Carpets', nameUrdu: 'ہاتھ سے بنے قالین اور گلیچے', description: 'Traditional handwoven rugs and carpets with intricate designs.', descriptionUrdu: 'روایتی ہاتھ سے بنے قالین اور گلیچے پیچیدہ ڈیزائن کے ساتھ.' },
                { name: 'Decorative Wall Hangings', nameUrdu: 'سجاوٹی دیوار لٹکانے والی اشیاء', description: 'Handmade wall hangings with traditional art and craft styles.', descriptionUrdu: 'ہاتھ سے بنے سجاوٹی دیوار لٹکانے والے فنون اور دستکاری کے انداز کے ساتھ.' },
                { name: 'Handmade Jewelry', nameUrdu: 'ہاتھ سے بنے زیورات', description: 'Jewelry made from beads, silver, and other materials.', descriptionUrdu: 'موتیوں، چاندی، اور دیگر مواد سے بنے زیورات.' }
            ]
        },
        {
            name: 'Traditional Apparel',
            nameUrdu: 'روایتی ملبوسات',
            description: 'Clothing items made using traditional techniques.',
            descriptionUrdu: 'روایتی تکنیکوں سے بنے ملبوسات.',
            categories: [
                { name: 'Hand-embroidered Clothes', nameUrdu: 'ہاتھ سے کڑھائی والے کپڑے', description: 'Hand-embroidered kurtas, sarees, and shawls.', descriptionUrdu: 'ہاتھ سے کڑھائی والے کرتا، ساڑیاں، اور شال.' },
                { name: 'Block-printed Fabrics', nameUrdu: 'بلک پرنٹڈ کپڑے', description: 'Traditional block-printed fabrics for various clothing items.', descriptionUrdu: 'مختلف ملبوسات کے لئے روایتی بلوک پرنٹ شدہ کپڑے.' },
                { name: 'Handmade Accessories', nameUrdu: 'ہاتھ سے بنے اسیسریز', description: 'Handmade scarves and stoles to complement traditional attire.', descriptionUrdu: 'روایتی لباس کے ساتھ میل کھانے کے لئے ہاتھ سے بنے اسکارف اور سٹول.' }
            ]
        },
        {
            name: 'Home Decor',
            nameUrdu: 'گھریلو سجاوٹ',
            description: 'Decorative and functional items for the home.',
            descriptionUrdu: 'گھر کی سجاوٹ اور افادیت کے لئے اشیاء.',
            categories: [
                { name: 'Clay and Ceramic Pottery', nameUrdu: 'مٹی اور سیرا مائیک کے برتن', description: 'Handcrafted clay and ceramic pottery items for home use.', descriptionUrdu: 'گھر کے استعمال کے لئے ہاتھ سے بنے مٹی اور سیرا مائیک کے برتن.' },
                { name: 'Wooden Carvings', nameUrdu: 'لکڑی کے کھدے ہوئے فنون', description: 'Beautifully carved wooden pieces for home decoration.', descriptionUrdu: 'گھر کی سجاوٹ کے لئے خوبصورت کھدی ہوئی لکڑی کے ٹکڑے.' },
                { name: 'Bamboo and Cane Furniture', nameUrdu: 'بانس اور چھڑی کا فرنیچر', description: 'Eco-friendly furniture made from bamboo and cane.', descriptionUrdu: 'بانس اور چھڑی سے بنایا گیا ماحول دوست فرنیچر.' },
                { name: 'Painted Flower Vases', nameUrdu: 'پینٹ کیے ہوئے پھولوں کے گلدان', description: 'Hand-painted flower vases with intricate designs.', descriptionUrdu: 'پیچیدہ ڈیزائن والے ہاتھ سے پینٹ کیے گئے پھولوں کے گلدان.' }
            ]
        },
        {
            name: 'Eco-Friendly Products',
            nameUrdu: 'ماحولیاتی طور پر دوست مصنوعات',
            description: 'Sustainable and eco-friendly products made with natural materials.',
            descriptionUrdu: 'قدرتی مواد سے بنائی گئی پائیدار اور ماحول دوست مصنوعات.',
            categories: [
                { name: 'Jute Bags', nameUrdu: 'جووتے کے بیگ', description: 'Eco-friendly bags made from jute fibers.', descriptionUrdu: 'جووتے کے ریشوں سے بنے ماحول دوست بیگ.' },
                { name: 'Recycled Paper Products', nameUrdu: 'ری سائیکل شدہ کاغذ کی مصنوعات', description: 'Paper products made from recycled materials.', descriptionUrdu: 'ری سائیکل شدہ مواد سے بنے کاغذ کے مصنوعات.' },
                { name: 'Plant-based Decorative Items', nameUrdu: 'پودوں سے بنی سجاوٹی اشیاء', description: 'Decorative items made from plant-based materials.', descriptionUrdu: 'پودوں سے بنائی گئی سجاوٹی اشیاء.' },
                { name: 'Biodegradable Storage Baskets', nameUrdu: 'ختم ہونے والی ذخیرہ کرنے والی ٹوکریاں', description: 'Eco-friendly and biodegradable storage baskets.', descriptionUrdu: 'ماحول دوست اور ختم ہونے والی ذخیرہ کرنے والی ٹوکریاں.' }
            ]
        },
        {
            name: 'Kitchenware',
            nameUrdu: 'کچن کا سامان',
            description: 'Handmade items for the kitchen and cooking.',
            descriptionUrdu: 'ہاتھ سے بنے کچن اور پکانے کے سامان.',
            categories: [
                { name: 'Hand-painted Crockery', nameUrdu: 'ہاتھ سے پینٹ کی ہوئی کریکری', description: 'Beautifully hand-painted crockery for the kitchen.', descriptionUrdu: 'کچن کے لئے خوبصورت ہاتھ سے پینٹ کی ہوئی کریکری.' },
                { name: 'Wooden Cooking Utensils', nameUrdu: 'لکڑی کے پکانے کے برتن', description: 'Eco-friendly wooden utensils for cooking and serving.', descriptionUrdu: 'پکانے اور سرو کرنے کے لئے ماحول دوست لکڑی کے برتن.' },
                { name: 'Traditional Food Storage Containers', nameUrdu: 'روایتی کھانا ذخیرہ کرنے والے کنٹینر', description: 'Handmade food storage containers made from natural materials.', descriptionUrdu: 'قدرتی مواد سے بنے ہاتھ سے بنے کھانا ذخیرہ کرنے والے کنٹینر.' }
            ]
        },
        {
            name: 'Personal Care',
            nameUrdu: 'ذاتی دیکھ بھال',
            description: 'Organic and handmade personal care products.',
            descriptionUrdu: 'نامیاتی اور ہاتھ سے بنے ذاتی دیکھ بھال کے مصنوعات.',
            categories: [
                { name: 'Organic Soaps and Skincare Products', nameUrdu: 'نامیاتی صابن اور جلد کی دیکھ بھال کے مصنوعات', description: 'Natural organic soaps and skincare products for healthy skin.', descriptionUrdu: 'صحت مند جلد کے لئے قدرتی نامیاتی صابن اور جلد کی دیکھ بھال کے مصنوعات.' },
                { name: 'Natural Oils', nameUrdu: 'قدرتی تیل', description: 'Coconut, mustard, and other natural oils for skincare and haircare.', descriptionUrdu: 'جلد اور بالوں کی دیکھ بھال کے لئے ناریل، سرسوں، اور دیگر قدرتی تیل.' },
                { name: 'Handmade Candles', nameUrdu: 'ہاتھ سے بنے موم بتیاں', description: 'Scented and unscented handmade candles for relaxation.', descriptionUrdu: 'آرام کے لئے خوشبو دار اور بے خوشبو ہاتھ سے بنے موم بتیاں.' }
            ]
        },
        {
            name: 'Cultural and Regional Specialties',
            nameUrdu: 'ثقافتی اور علاقائی خصوصیات',
            description: 'Unique products representing local culture and traditions.',
            descriptionUrdu: 'مقامی ثقافت اور روایات کی نمائندگی کرنے والی منفرد مصنوعات.',
            categories: [
                { name: 'Local Art Pieces', nameUrdu: 'مقامی فن پارے', description: 'Art pieces made by local artisans showcasing traditional styles.', descriptionUrdu: 'مقامی دستکاروں کے بنائے گئے فن پارے جو روایتی انداز دکھاتے ہیں.' },
                { name: 'Regional Spices and Herbs', nameUrdu: 'علاقائی مصالحے اور جڑی بوٹیاں', description: 'Spices and herbs used in traditional cooking from various regions.', descriptionUrdu: 'مختلف علاقوں سے روایتی پکوان میں استعمال ہونے والے مصالحے اور جڑی بوٹیاں.' },
                { name: 'Traditional Snacks or Packaged Foods', nameUrdu: 'روایتی ناشتے یا پیک شدہ کھانے', description: 'Handmade regional snacks or packaged foods unique to the area.', descriptionUrdu: 'ہاتھ سے بنے علاقائی ناشتے یا پیک شدہ کھانے جو اس علاقے کی خصوصیت ہیں.' }
            ]
        },
        {
            name: 'Bags and Accessories',
            nameUrdu: 'بیگ اور اسیسریز',
            description: 'Handmade bags and accessories for everyday use.',
            descriptionUrdu: 'روزمرہ کے استعمال کے لئے ہاتھ سے بنے بیگ اور اسیسریز.',
            categories: [
                { name: 'Hand-stitched Purses', nameUrdu: 'ہاتھ سے سلے ہوئے پرس', description: 'Hand-stitched purses with traditional patterns and designs.', descriptionUrdu: 'روایتی نمونوں اور ڈیزائن کے ساتھ ہاتھ سے سلے ہوئے پرس.' },
                { name: 'Embroidered Wallets', nameUrdu: 'کڑھائی والے بٹوے', description: 'Beautifully embroidered wallets made by local artisans.', descriptionUrdu: 'مقامی دستکاروں کے بنائے گئے خوبصورت کڑھائی والے بٹوہ.' },
                { name: 'Handmade Backpacks', nameUrdu: 'ہاتھ سے بنے بیگ پیک', description: 'Stylish and durable handmade backpacks for everyday use.', descriptionUrdu: 'روزمرہ کے استعمال کے لئے اسٹائلش اور پائیدار ہاتھ سے بنے بیگ پیک.' }
            ]
        },
        {
            name: 'Toys and Kids\' Items',
            nameUrdu: 'کھلونے اور بچوں کی اشیاء',
            description: 'Eco-friendly and handmade items for children.',
            descriptionUrdu: 'بچوں کے لئے ماحول دوست اور ہاتھ سے بنے سامان.',
            categories: [
                { name: 'Handmade Stuffed Toys', nameUrdu: 'ہاتھ سے بنے بھرے ہوئے کھلونے', description: 'Handmade soft toys for children, crafted with love and care.', descriptionUrdu: 'بچوں کے لئے ہاتھ سے بنے نرم کھلونے، محبت اور دیکھ بھال کے ساتھ بنے ہوئے.' },
                { name: 'Wooden Puzzle Sets', nameUrdu: 'لکڑی کے پہیلی کے سیٹ', description: 'Wooden puzzles for kids, designed to improve cognitive skills.', descriptionUrdu: 'بچوں کے لئے لکڑی کے پہیلیاں، جو ذہنی مہارت کو بہتر بناتی ہیں.' },
                { name: 'Eco-friendly Kids\' Clothing', nameUrdu: 'ماحول دوست بچوں کے ملبوسات', description: 'Eco-friendly, comfortable clothing for children made from natural fibers.', descriptionUrdu: 'قدرتی ریشوں سے بنے ماحول دوست، آرام دہ ملبوسات.' }
            ]
        },
        {
            name: 'Festive and Gift Items',
            nameUrdu: 'تہوار اور تحفے کی اشیاء',
            description: 'Special handcrafted items for gifting and festive celebrations.',
            descriptionUrdu: 'تحفے دینے اور تہواروں کی تقریبات کے لئے خصوصی ہاتھ سے بنے سامان.',
            categories: [
                { name: 'Gift Wrapping Materials', nameUrdu: 'تحفے لپیٹنے کا سامان', description: 'Handmade gift wrapping materials for a personal touch.', descriptionUrdu: 'ذاتی لمس کے لئے ہاتھ سے بنے تحفے لپیٹنے کا سامان.' },
                { name: 'Festive Decorations', nameUrdu: 'تہوار کی سجاوٹ', description: 'Handcrafted decorations for festivals like Diwali and Eid.', descriptionUrdu: 'دیوالی اور عید جیسے تہواروں کے لئے ہاتھ سے بنے سجاوٹ.' },
                { name: 'Handcrafted Greeting Cards', nameUrdu: 'ہاتھ سے بنے گreeting کارڈ', description: 'Beautiful handmade greeting cards for all occasions.', descriptionUrdu: 'تمام مواقع کے لئے خوبصورت ہاتھ سے بنے گreeting کارڈ.' }
            ]
        }
    ];

    try {
        // Clear existing data
        await Category.deleteMany({});
        await CategoryGroup.deleteMany({});

        for (const group of data) {
            const categoryIds = [];

            for (const category of group.categories) {
                const newCategory = new Category({
                    name: category.name,
                    nameUrdu: category.nameUrdu,
                    description: category.description,
                    descriptionUrdu: category.descriptionUrdu,
                    categoryGroup: null // Will be updated later
                });

                const savedCategory = await newCategory.save();
                categoryIds.push(savedCategory._id);
            }

            const newCategoryGroup = new CategoryGroup({
                name: group.name,
                nameUrdu: group.nameUrdu,
                description: group.description,
                descriptionUrdu: group.descriptionUrdu,
                categories: categoryIds,
            });

            const savedCategoryGroup = await newCategoryGroup.save();

            // Update categoryGroup field in each category
            for (const categoryId of categoryIds) {
                await Category.findByIdAndUpdate(categoryId, { categoryGroup: savedCategoryGroup._id });
            }
        }

        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).json({ message: 'Error creating categories' });
    }

    res.status(201).json({ message: 'Successfully created categories' });

});

// Function to get all category groups along with their categories
const getCategories = asyncHandler(async (req, res) => {
    try {
        const categoryGroups = await CategoryGroup.find().populate('categories');
        res.status(200).json(categoryGroups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category groups' });
    }
});

// get a single product by ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.status(200).json({product});
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = { addProduct, getAllProducts, createCategories, getCategories, getProductById };