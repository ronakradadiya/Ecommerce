const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id)
    .then((category) => {
      if (!category) {
        return res.status(400).json({
          error: "Category not found in DB",
        });
      }
      req.category = category;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Category not found in DB",
      });
    });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category
    .save()
    .then((category) => {
      res.json({ category });
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Not able to save category in DB",
      });
    });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find()
    .then((categories) => {
      return res.json(categories);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "No categories found",
      });
    });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category
    .save()
    .then((updatedCategory) => {
      res.json(updatedCategory);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Failed to update category",
      });
    });
};

exports.removeCategory = (req, res) => {
  console.log("DELETE", req.category);
  const category = req.category;
  const deletedCategoryName = category.name;
  category
    .remove()
    .then((category) => {
      console.log("DELETED");
      res.json({
        message: "Successfully deleted",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: `Failed to delete the category ${deletedCategoryName}`,
      });
    });
};
