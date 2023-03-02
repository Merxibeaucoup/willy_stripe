const express = require("express");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_KEY);
const { v4: uuidv4 } = require("uuid");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//routes
app.get("/", (req, res) => {
  res.send("IT WORKS ");
});

app.post("/checkout", async (req, res) => {
  const { number, token } = req.body;
  console.log("AMOUNT ", number);
  const idempotencyKey = uuidv4();

  const lineItems = [];

  await stripe.checkout.sessions.create({
    line_items: [
      { name: "merci", currency: "usd", quantity: 1, amount: number * 100 },
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "https://localhost:3000/cancel",
    payment_method_types: ["card"],
    mode: "payment",
  });

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: number * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
        },
        { idempotencyKey: idempotencyKey }
      );
      // latest
      res.json({ url: session.url });
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
