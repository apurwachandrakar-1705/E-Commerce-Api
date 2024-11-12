const express = require('express')
const { Product } = require('../models/product')
const Category = require('../models/category')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP(file.mimetype)
        let uploaderror = new Error('invalid image type')
        if (isValid) {
            uploaderror = null
        }
        cb(uploaderror, '/public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP(file.mimetype)
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})
const uploadOptions = multer({ storage: storage })
router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category')
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})
router.get('/spec', async (req, res) => {
    const productList = await Product.find().select('name image -_id')
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})
router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)

    if (!category) return res.status(400).send('Invalid category')
    const fileName = req.file.filename
    const file = req.file
    if (!file) return res.status(400).send('no file')

    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    product = await product.save()
    if (!product) return res.status(500).send('The product cannot be created')
    res.send(product)
    product
        .save()
        .then((createdProduct) => res.status(201).json(createdProduct))
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false,
            })
        })
})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid product id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.imag,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )
    if (!product) {
        return res.status(500).send('the product cannot be update')
    }
    res.send(product)
})
router.delete('/:id', async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        return res
            .status(400)
            .json({ success: false, msg: 'cannot delete product' })
    }
    res.status(200).json({ success: true, msg: 'deleted the product' })
})
router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments() // Remove the callback here
        res.send({ count: productCount })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})
router.get('/get/featured/:count', async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0
        const products = await Product.find({ isFeatured: true }).limit(+count)
        res.send(products)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})
router.put(
    '/gallery-image/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid product id')
        }
        const files = req.files
        let imagesPaths = []
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.fileName}`)
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        )
        if (!product) {
            return res.status(500).send('the product cannot be update')
        }
        res.send(product)
    }
)
module.exports = router
