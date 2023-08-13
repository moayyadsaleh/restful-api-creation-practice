import express from "express";
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files (CSS, JS)
app.set('view engine', 'ejs');

const uri = 'mongodb://127.0.0.1:27017/wikiDB';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Mongoose connected to ' + uri);
});

db.on('error', error => {
    console.error('Mongoose connection error:', error);
});

db.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Define schema 
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});
// Define model
const Article = mongoose.model('Article', articleSchema );


app.get("/articles", (req, res) => {
    Article.find()
        .then(foundArticles => {
            console.log(foundArticles);
            res.send(foundArticles)
        })
        .catch(err => {
            console.log("Error fetching articles", err);
            res.status(500).send("Error fetching articles");
        });
});









app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});







