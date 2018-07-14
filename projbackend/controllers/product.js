const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec()
    .then((product) => {
      console.log("PRODUCT", product);
      req.product = product;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Product not found",
      });
    });
};

exports.createProduct = (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    console.log("fields is ", fields);
    console.log("file is ", file);
    //destructure the fields
    const { name, description, price, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = new Product(fields);
    console.log(product);
    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
      product.photoName = file.photo.name;
    }

    //save to the DB
    product
      .save()
      .then((product) => {
        console.log("product is ", product);
        return res.json(product);
      })
      .catch((err) => {
        return res.status(400).json({
          error: "Saving tshirt in DB failed",
        });
      });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.photo = (req, res, next) => {
  console.log("REQ PRODUCT", req.product.photo);
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product
    .remove()
    .then((deletedProduct) => {
      return res.json({
        message: "Deletion was a success",
        deletedProduct,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    });
};

exports.updateProduct = (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    console.log("FIELDS", fields);
    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
      product.photoName = file.photo.name;
    }

    //save to the DB
    product
      .save()
      .then((product) => {
        return res.json(product);
      })
      .catch((err) => {
        return res.status(400).json({
          error: "Updation of product failed",
        });
      });
  });
};

// .sort([["updatedAt", "descending"]])
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo") //dont select photo
    .populate("category")
    .sort({
      [sortBy]: "asc",
    })
    .limit(limit)
    .exec()
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      return res.status(400).json({
        error: "No product found",
      });
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  console.log("UPDATE STOCK");
  let myOperations = req.body.order.products.map((product) => {
    console.log("PRODUCT", product);
    return {
      updateOne: {
        //filter - to find out based on Id
        filter: {
          _id: product._id,
        },
        update: {
          $inc: {
            stock: -product.count,
            sold: +product.count,
          },
        },
      },
    };
  });

  console.log("OPERATIONS", myOperations);

  Product.bulkWrite(myOperations, {})
    .then((products) => {
      next();
    })
    .catch((error) => {
      return res.status(400).json({
        error: "bulk operations failed",
      });
    });
};
