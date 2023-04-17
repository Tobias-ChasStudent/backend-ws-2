const express = require('express')
const exphbs = require('express-handlebars')
const {
    MongoClient,
    ObjectId
} = require('mongodb')
const fs = require('fs');
const bodyParser = require('body-parser')

const connectionUrl = "mongodb://127.0.0.1:27017"

const client = new MongoClient(connectionUrl)

const dbName = "Workshop-2"

async function getSeriesCollection() {
    await client.connect()
    console.log("Connected");
    const db = client.db(dbName)
    const collection = db.collection("series")
    return collection
}


const app = express()

app.engine('hbs', exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs"
}))

app.set("view engine", "hbs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: false
}))

//////////// Home ///////////

app.get('/', (req, res) => {
    console.log("Home");
    res.render('home')
})

//////////// Top series ///////////

////Series display page, Read
app.get('/series', async (req, res) => {
    console.log("Top Series");
    /* let rawdata = fs.readFileSync('./top5Series.json');
    let movies = JSON.parse(rawdata); */
    const collection = await getSeriesCollection()
    const movies = await collection.find({}).toArray();

    movies.sort((a, b) => b.rating - a.rating)

    console.log("movies =>", movies);


    res.render("series", {movies: movies})
})

////Series add page, Create
app.get('/new-series', (req, res) => {
    res.render('new-series')
})
app.post('/new-series', async (req, res) => {
    const newSeries = {
        title: req.body.title,
        desc: req.body.desc,
        rating: parseFloat(req.body.rating),
    }

    const collection = await getSeriesCollection()

    await collection.insertOne(newSeries)

    res.redirect("/series")

    
})

////Series edit page, Update
app.get('/series/:id', async (req, res) => {
    const objectId = new ObjectId(req.params.id);
    const collection = await getSeriesCollection()
    const selectedSeries = await collection.findOne({
        _id: objectId
    })
    console.log(selectedSeries);

    res.render('edit-series', {
        selectedSeries
    })
})

app.post('/edit-series/:id', async (req, res) => {

    const updatedSeries = {
        title: req.body.title,
        desc: req.body.desc,
        rating: parseFloat(req.body.rating),
    }

    const objectId = new ObjectId(req.params.id);
    const collection = await getSeriesCollection()
    await collection.updateOne({
        _id: objectId
    }, {
        $set: updatedSeries
    })



    res.redirect('/series')
})

////Delete a series, Delete
app.post("/delete-series/:id", async (req, res) => {
    const objectId = new ObjectId(req.params.id);
    const collection = await getSeriesCollection()
    await collection.deleteOne({
        _id: objectId
    })

    res.redirect('/series')
})



app.listen(8000, () => {
    console.log("http://localhost:8000");
})