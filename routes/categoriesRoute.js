const { Category } = require('../models/categoryModel');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(categoryList);
})

// add category
router.post(`/`, async (req, res) => {
    let category = Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save()
    if (!category) {
        return res
            .status(404)
            .send({
                message: "The category cannot be created",
                success: false
            })
    } else {
        return res.
        status(200).
        send(category)
    }
})

// delete category
router.delete('/:id', async (req, res) => {
    try {
        let category = await Category.findByIdAndRemove(req.params.id)
        if (category) {
            return res.
            status(200).
            send({
                message: "Succesfully deleted categoty",
                success: true
            })
        } else {
            return res.
            status(404).
            send({
                message: "Category not found",
                success: false
            })
        }
    }
    catch(err){
        return res.
        status(400).
        send({
            error : err,
            success : false
        })
    }
})

module.exports = router;