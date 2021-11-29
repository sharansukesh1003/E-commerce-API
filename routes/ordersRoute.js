const { Order } = require('../models/orderModel');
const { OrderItem } = require('../models/orderItemModel');
const express = require('express');
const router = express.Router();

// get all orders
router.get(`/`, async (req, res) => {
    const orderList = await Order.find().
    populate('user', 'name').
    sort({
        'dateOrdered': -1
    }) // Reverse the result
    if (!orderList) {
        return res
            .status(500)
            .send({
                message: "Something went wrong",
                success: false
            })
    } else {
        return res.send({
            success: true,
            orders: orderList
        });
    }
})

// get order by id
router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        }) // populating orders with orderItems 
        // then populating orderItems with products 
        // then product with categories
        .sort({
            'dateOrdered': -1
        }) // Reverse the result
    if (!order) {
        return res
            .status(500)
            .send({
                message: "Could not find the given order",
                success: false
            })
    } else {
        return res.send({
            success: true,
            order: order
        });
    }
})

// create a new order
router.post('/', async (req, res) => {
    // mapping through individual order items
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    // calculating the total price
    const orderItemsIdsResolved = await orderItemsIds
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
        const orderItem = await OrderItem.findById(orderItemId)
            .populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    let finalPrice = 0
    totalPrices.forEach(n => finalPrice += n)
    let order = Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: finalPrice,
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

// update order status
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, {
                status: req.body.status,
            }, {
                new: true
            }
        )
        if (!order) {
            return res.
            status(400).
            send({
                message: "Order not found!",
                success: false
            })
        } else {
            return res.
            status(200).
            send({
                message: "Order updated.",
                data: order,
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

// delete order
router.delete('/:id', async (req, res) => {
    try {
        Order.findByIdAndRemove(req.params.id).then(async order => {
            if (order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem)
                }) // deleting order items
                return res.
                status(200).
                send({
                    message: "Succesfully cancelled the order.",
                    success: true
                })
            } else {
                return res.
                status(404).
                send({
                    message: "Order not found!",
                    success: false
                })
            }
        })
    } catch (err) {
        return res.
        status(400).
        send({
            error: err,
            success: false
        })
    }
})

// get total sales
router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([{
            $group: {
                _id: null, // adding id since mongoose can't return object without id
                totalsales: {
                    $sum: '$totalPrice'
                }
            }
        }])

        if (!totalSales) {
            return res
                .status(400)
                .send({
                    message: "Order sales could not be generated"
                })
        } else {
            return res
                .status(200)
                .send({
                    sales: totalSales[0]["totalsales"]
                })
        }
    } catch (err) {
        return res
            .status(400)
            .send({
                message: "Something went wrong"
            })
    }
})

// get count of total orders
router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
        res.status(500).json({
            success: false
        })
    }
    res.send({
        orderCount: orderCount
    });
})

// get individual user order
router.get(`/userorder/:id`, async (req, res) => {
    const userOrderList = await Order.find({
            user: req.params.id
        })
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        })
        .sort({
            'dateOrdered': -1
        }) // Reverse the result    
    if (!userOrderList) {
        return res
            .status(500)
            .send({
                message: "Something went wrong",
                success: false
            })
    } else {
        return res.send({
            success: true,
            orders: userOrderList
        });
    }
})

module.exports = router;