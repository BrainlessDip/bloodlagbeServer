const express = require("express");
const app = express();
const cors = require("cors");
const { createClerkClient } = require("@clerk/backend");
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { getAuth } = require("@clerk/express");
const { clerkMiddleware } = require("@clerk/express");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_API_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});
app.use(clerkMiddleware({ clerkClient }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bananacluster.d9hnwzy.mongodb.net/?appName=BananaCluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("bloodlagbe_db");
    const usersCollection = db.collection("users");

    app.get("/blood-groups", async (req, res) => {
      const result = await usersCollection
        .find(
          {},
          {
            projection: {
              _id: 0,
              email: 0,
              bio: 0,
              social_links: 0,
              createdAt: 0,
            },
          }
        )
        .toArray();

      if (result) {
        res.status(200).json(result);
      } else {
        return res.status(404).json({ error: "User not found." });
      }
    });
    app.get("/me", async (req, res) => {
      const data = getAuth(req);
      if (!data.isAuthenticated) {
        res.status(401).json({ error: "Unauthorized" });
      }
      const result = await usersCollection.findOne(
        { email: data.sessionClaims.email },
        { projection: { _id: 0 } }
      );

      if (result) {
        res.status(200).json(result);
      } else {
        return res.status(404).json({ error: "User not found." });
      }
    });

    app.patch("/me", async (req, res) => {
      const data = getAuth(req);
      if (!data.isAuthenticated) {
        res.status(401).json({ error: "Unauthorized" });
      }

      try {
        const payload = req.body;
        const email = data.sessionClaims.email;

        const updateData = {};

        if (payload.first_name !== undefined)
          updateData.first_name = payload.first_name;
        if (payload.last_name !== undefined)
          updateData.last_name = payload.last_name;
        if (payload.blood_group !== undefined)
          updateData.blood_group = payload.blood_group;
        if (payload.phone_number !== undefined)
          updateData.phone_number = payload.phone_number;
        if (payload.bio !== undefined) updateData.bio = payload.bio;
        if (payload.location !== undefined)
          updateData.location = payload.location;

        if (payload.total_donation !== undefined)
          updateData.total_donation = payload.total_donation;
        if (payload.last_donation !== undefined)
          updateData.last_donation = new Date(payload.last_donation);

        if (payload.social_links) {
          updateData.social_links = {
            facebook: payload.social_links.facebook || "",
            telegram: payload.social_links.telegram || "",
            whatsapp: payload.social_links.whatsapp || "",
          };
        }

        delete updateData.email;
        delete updateData.clerkId;
        delete updateData.createdAt;
        const result = await usersCollection.updateOne(
          { email: email },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
      }
    });

    /// clerk webhooks
    app.post("/webhooks/clerk", async (req, res) => {
      try {
        const payload = req.body;
        if (payload.type === "user.created") {
          const user = payload.data;
          const existing = await usersCollection.findOne({
            email: user.email_addresses[0].email_address,
          });
          if (!existing) {
            await usersCollection.insertOne({
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email_addresses[0].email_address,
              clerkId: user.id,
              blood_group: "",
              phone_number: "",
              bio: "",
              total_donation: 0,
              last_donation: null,
              social_links: {
                facebook: "",
                telegram: "",
                whatsapp: "",
              },
              location: "",
              createdAt: new Date(),
            });
          }
        }
        res.status(200).json({ received: true });
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
      }
    });
    console.log("Database connected");
  } catch (err) {
    console.error(err);
  }
}
run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
