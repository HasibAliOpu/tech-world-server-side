const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hvm8i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const itemCollection = client.db("techWorld").collection("items");

async function run() {
  try {
    await client.connect();
    // get all item
    app.get("/item", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get by id
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const item = await itemCollection.findOne({ _id: ObjectId(id) });

      res.send(item);
    });
  } catch (error) {
    console.log(error);
  }
}
run();

app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.listen(port, () => {
  console.log("Listening Port", port);
});
