const { Product } = require('../models/productModel');
const express = require('express');
const { Category } = require('../models/categoryModel');
const mongoose = require('mongoose')
const router = express.Router();

// get all products with or without categories
router.get(`/`, async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = {
            category: req.query.categories.split(',')
        }
    }
    const productList = await Product.find(filter);
    if (!productList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(productList);
})

// get product by id
router.get(`/:id`, async (req, res) => {
    try {
        const productList = await Product.findById(req.params.id)
            .select('name image -_id') // query for particular properties, for excluding add -
            .populate('category')
        if (!productList) {
            res.status(500).json({
                success: false
            })
        }
        res.send(productList);
    } catch (err) {
        console.log(err)
        return res.send(err)
    }
})

// add new product
router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.
        status(400).
        send({
            message: "Invalid Category"
        })
    }
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated,
        countInStock: req.body.countInStock
    })
    product = await product.save()
    if (!product) {
        return res.
        status(500).
        send({
            message: "The Porduct cannot be created."
        })
    } else {
        return res.
        status(200).
        send({
            message: "Success",
            product: product
        })
    }
})

// update product
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.
        status(200).
        send({
            message: "Invalid Object ID"
        })
    }
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.
        status(400).
        send({
            message: "Invalid Category"
        })
    }
    try {
        let product = await Product.findByIdAndUpdate(
            req.params.id, {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                rating: req.body.rating,
                isFeatured: req.body.isFeatured,
                dateCreated: req.body.dateCreated,
                countInStock: req.body.countInStock
            }, {
                new: true
            }
        )
        if (!product) {
            return res.
            status(400).
            send({
                message: "Product not found!",
                success: false
            })
        } else {
            return res.
            status(200).
            send({
                message: "Product updated.",
                data: product,
                success: true
            })
        }
    } catch (err) {
        return res.
        status(400).
        send({
            error: err,
            success: false
        })
    }
})

// delete product
router.delete('/:id', async (req, res) => {
    try {
        let product = await Product.findByIdAndRemove(req.params.id)
        if (product) {
            return res.
            status(200).
            send({
                message: "Succesfully deleted product.",
                success: true
            })
        } else {
            return res.
            status(404).
            send({
                message: "Product not found!",
                success: false
            })
        }
    } catch (err) {
        return res.
        status(400).
        send({
            error: err,
            success: false
        })
    }
})

// get count of all products
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.status(500).json({
            success: false
        })
    }
    res.send({
        productCount: productCount
    });
})

// get featured products
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const featuredProduct = await Product.find({
            isFeatured: true
        })
        .limit(+count) // will limit the returned object to the count (added + to typecast to int)
    if (!featuredProduct) {
        res.status(500).json({
            success: false
        })
    }
    res.send({
        featuredProduct: featuredProduct
    });
})

module.exports = router;