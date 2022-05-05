const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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

    // GET ALL ITEM
    app.get("/item", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET ITEM BY ID
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const item = await itemCollection.findOne({ _id: ObjectId(id) });

      res.send(item);
    });

    // POST
    app.post("/item", async (req, res) => {
      const newItem = req.body;
      await itemCollection.insertOne(newItem);
      res.send({
        success: true,
        message: `${newItem.name} Successfully Added`,
      });
    });

    // UPDATE Item Quantity
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updatedQuantity.newQuantity,
        },
      };
      const result = await itemCollection.updateOne(filter, updateDoc, options);
      if (!result.modifiedCount) {
        return res.send({ success: false, error: "Something Was wrong" });
      }
      res.send({ success: true, message: "Successfully Delivered the item" });
    });

    // DELETE
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const result = await itemCollection.deleteOne({ _id: ObjectId(id) });
      if (!result.deletedCount) {
        return res.send({ success: false, error: "Something Was wrong" });
      }
      res.send({ success: true, message: "Successfully Delete the item" });
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
