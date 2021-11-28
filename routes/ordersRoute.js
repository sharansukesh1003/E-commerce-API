const { Order } = require('../models/orderModel');
const { OrderItem } = require('../models/orderItemModel');
const express = require('express');
const router = express.Router();

// get all orders
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().
    populate('user', 'name').
    sort({'dateOrdered' : -1}) // Reverse the result
    if(!orderList) {
        return res
        .status(500)
        .send({
            message : "Something went wrong",
            success : false
        })
    } 
    else{
        return res.send({
            success : true,
            orders : orderList
        });
    }
})

// get order by id
router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path : 'orderItems',
        populate : {
            path : 'product',
            populate : 'category'
        }
    })// populating orders with orderItems 
    // then populating orderItems with products 
    // then product with categories
    .sort({'dateOrdered' : -1}) // Reverse the result
    if(!order) {
        return res
        .status(500)
        .send({
            message : "Could not find the given order",
            success: false
        })
    } 
    else{
        return res.send({
            success : true,
            order : order
        });
    }
})

// create a new order
router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map( async orderItem => {
        let newOrderItem = OrderItem({
            quantity : orderItem.quantity,
            product : orderItem.product
        })
        newOrderItem = await newOrderItem.save() 
        return newOrderItem._id
    }))
    const orderItemsIdsResolved = await orderItemsIds
    let order = Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: 500,
        user: req.body.user,
    })
    order = await order.save()
    if (!order) {
        return res
            .status(404)
            .send({
                message: "The order could not be placed.",
                success: false
            })
    } else {
        return res.
        status(200).
        send(order)
    }
})

module.exports = router;

/**
Order Example:
{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "61a08070e9b63d7edfac99ae"
        },
        {
            "quantity": 2,
            "product" : "61a0764b653284ce9a8b2179"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "61a34bcbb6367ea512348a8f"
}
**/