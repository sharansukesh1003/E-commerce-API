const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },

    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    brand: {
        type: String,
    },
    price: {
        type: Number,
        default: 0,
        min: 1
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    rating: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
})

productSchema.virtual('id').get( async function () {
    try{
        let id = await this._id // will convert _id to id (front end friendly)
        return id.toHexString()
    }
    catch(err){
        console.log(err)
    }
})

productSchema.set('toJSON', {
    virtuals: true
})

exports.Product = mongoose.model('Product', productSchema);