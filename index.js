const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
};

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

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: "7d",
      });
      res.send({ accessToken });
    });

    // GET ALL ITEM
    app.get("/item", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET API for find by email
    app.get("/myItem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail === email) {
        const cursor = itemCollection.find({ email });
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
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
      const updatedQuantity = req.body?.newQuantity;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updatedQuantity,
        },
      };
      const result = await itemCollection.updateOne(
        { _id: ObjectId(id) },
        updateDoc,
        options
      );
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
