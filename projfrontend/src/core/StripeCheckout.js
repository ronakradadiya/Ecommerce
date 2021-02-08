import React, { useState } from "react";
import { isAutheticated } from "../auth/helper";
import { cartEmpty } from "./helper/cartHelper";
import { Link } from "react-router-dom";
import StripeCheckoutButton from "react-stripe-checkout";
import { API } from "../backend";
import { createOrder } from "./helper/orderHelper";

const StripeCheckout = ({ products, setReload }) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    error: "",
    address: "",
  });

  const tokenData = isAutheticated() && isAutheticated().token;
  const userId = isAutheticated() && isAutheticated().user._id;

  const getFinalAmount = () => {
    let amount = 0;
    products.map((p) => {
      amount = amount + p.price;
    });
    return amount;
  };

  const makePayment = (token) => {
    const body = {
      token,
      products,
      amount: getFinalAmount(),
    };
    const headers = {
      "Content-Type": "application/json",
    };
    return fetch(`${API}/stripepayment`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        //call further methods
        console.log("PAYMENT SUCCESS");
        const orderData = {
          products,
          transaction_id: data.id,
          amount: data.amount,
        };
        createOrder(userId, tokenData, orderData)
          .then((data) => {
            if (data.error) {
              console.log(data.error);
            } else {
              console.log("Success", data);
            }
          })
          .catch((err) => console.log(err));
        cartEmpty(() => {
          console.log("Did we got a crash");
        });
        setReload((prevState) => !prevState);
      })
      .catch((error) => console.log(error));
  };

  const showStripeButton = () => {
    return isAutheticated() ? (
      <StripeCheckoutButton
        stripeKey={process.env.REACT_APP_PUBLISH_KEY}
        token={makePayment}
        amount={getFinalAmount() * 100}
        name="Buy Tshirts"
        description="A test account"
        shippingAddress
        billingAddress
      >
        <button className="btn btn-success">Pay with stripe</button>
      </StripeCheckoutButton>
    ) : (
      <Link to="/signin">
        <button className="btn btn-warning">Signin</button>
      </Link>
    );
  };

  return (
    <div>
      {isAutheticated() ? (
        <h3 className="text-white">Stripe Checkout ${getFinalAmount()}</h3>
      ) : (
        <h3>Please sign in to proceed</h3>
      )}
      {products.length >= 1 && showStripeButton()}
    </div>
  );
};

export default StripeCheckout;
