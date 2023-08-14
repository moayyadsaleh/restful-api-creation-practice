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


////////////////////////////Requests Targeting all Articles

app.route("/articles")
    .get((req, res) => {
        Article.find()
            .then(foundArticles => {
                console.log(foundArticles);
                res.send(foundArticles);
            })
            .catch(err => {
                console.log("Error fetching articles", err);
                res.status(500).send("Error fetching articles");
            });
    })
    .post((req, res) => {
        console.log(req.body.title);
        console.log(req.body.content);
        
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        
        newArticle.save()
            .then(savedArticle => {
                console.log("Article saved successfully:", savedArticle);
                res.status(201).send("Article saved successfully");
            })
            .catch(err => {
                console.log("Error saving article:", err);
                res.status(500).send("Error saving article");
            });
    })
    .delete((req, res) => {
        Article.deleteMany()
            .then(deletedArticles => {
                console.log(deletedArticles, "Articles are successfully deleted");
                res.send(deletedArticles);
            })
            .catch(err => {
                console.log("Error deleting articles", err);
                res.status(500).send("Error deleting articles");
            });
        });

////////////////////////////Requests Targeting a Specific  Article
app.route("/articles/:articleTitle")

.get((req, res) => {
    // Extract the value of :articleTitle from the URL parameter
    const articleTitle = req.params.articleTitle;

    // Use the extracted articleTitle to find the corresponding article in the database
    Article.findOne({ title: articleTitle })
      .then(foundArticle => {
        if (foundArticle) {
          res.send(foundArticle);
        } else {
          res.status(404).send('Article not found. No article matching the title was found');
        }
      })
      .catch(error => {
        console.error('Error fetching article:', error);
        res.status(500).send('Error fetching article');
      });
  })

  .put((req, res) => {
    Article.updateOne(
        { title: req.params.articleTitle },
        { $set: { title: req.body.title, content: req.body.content } }
    )
    .then(result => {
        if (result.n === 0) {
            res.send("Article not found.");
        } else {
            res.send("Article updated successfully.");
        }
    })
    .catch(err => {
        console.log("Error updating article:", err);
        res.status(500).send("Error updating article");
    });
})

.patch((req, res) => {
    Article.updateOne(
        { title: req.params.articleTitle },
        { $set: req.body } // Update only the fields provided in the request body
    )
    .then(result => {
        if (result.n === 0) {
            res.send("Article not found.");
        } else {
            res.send("Article updated successfully.");
        }
    })
    .catch(err => {
        console.log("Error updating article:", err);
        res.status(500).send("Error updating article");
    });
})

.delete((req, res) => {
    Article.deleteOne({ title: req.params.articleTitle })
        .then(result => {
            if (result.deletedCount === 0) {
                res.send("Article not found.");
            } else {
                res.send("Article deleted successfully.");
            }
        })
        .catch(err => {
            console.error("Error deleting article:", err);
            res.status(500).send("Error deleting article");
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




