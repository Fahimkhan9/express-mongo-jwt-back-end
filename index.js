const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const port = 8000;
const MongoClient = require("mongodb").MongoClient;

require('dotenv').config()


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vigvf.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

var admin = require("firebase-admin");

var serviceAccount = require("./secrets.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB,
});



app.use(cors());
app.use(bodyparser.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const collection = client.db("burjAlArab").collection("burjAlArab");
  console.log("con");
  app.post("/addbooking", (req, res) => {
    const newbooking = req.body;
    collection.insertOne(newbooking).then((re) => {
      res.send(re.insertedCount > 0);
    });
    console.log(newbooking);
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });

      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          let email = decodedToken.email;
          if (email == req.query.email) {
            collection.find({ email: req.query.email }).toArray((err, ele) => {
              res.send(ele);
            });
            console.log(email, req.query.email);
          }
        })
        .catch(function (error) {});
    }
    else{
      res.status(401).send("unauthorized access")
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
