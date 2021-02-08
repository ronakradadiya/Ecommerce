const stripe = require("stripe")(process.env.STRIPE_SECRET);
const uuid = require("uuid/v4");

exports.makepayment = (req, res) => {
  const { products, token, amount } = req.body;
  console.log("PRODUCTS", products);

  let backEndAmount = 0;
  products.map((p) => (backEndAmount = backEndAmount + p.price));

  if (!backEndAmount === amount) {
    return res.json(404).json({
      error: "Amount handling failed",
    });
  }

  const idempotencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      console.log(customer);
      stripe.charges
        .create(
          {
            amount: amount * 100,
            currency: "usd",
            customer: customer.id,
            receipt_email: token.email,
            description: "a test account",
            shipping: {
              name: token.card.name,
              address: {
                line1: token.card.address_line1,
                line2: token.card.address_line2,
                city: token.card.address_city,
                country: token.card.address_country,
              },
            },
          },
          { idempotencyKey }
        )
        .then((result) => res.status(200).json(result))
        .catch((err) => console.log(err));
    });
};
