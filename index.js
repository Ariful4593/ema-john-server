const express = require('express')
const app = express()
const port = 4000
app.get('/', (req, res) => {
    res.send('Hello World!')
  })
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config()


app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsirj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db("emaJohnStore").collection("products");
    const ordersCollection = client.db("emaJohnStore").collection("orders");

    app.post('/addProduct', (req, res) =>{
        const product = req.body;
        productsCollection.insertOne(product)
        .then(result =>{
            console.log(result.insertedCount)
            res.send(result.insertedCount)
        })
    })

    app.get('/products', (req, res) =>{
        const search = req.query.body;
        productsCollection.find({name: {$regex: search}})
        .toArray( (err, documents) =>{
            res.send(documents)
        } )
    })

    app.get('/product/:key', (req, res) =>{
        productsCollection.find({key: req.params.key})
        .toArray( (err, documents) =>{
            res.send(documents[0])
        } )
    })

    app.post('/productsByKeys', (req, res) => {
        const productKeys = req.body;
        productsCollection.find({key: { $in: productKeys} })
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addOrder', (req, res) =>{
        const order = req.body;
        ordersCollection.insertOne(order)
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })
});


app.listen(process.env.PORT || port);