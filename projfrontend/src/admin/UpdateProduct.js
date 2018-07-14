import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link, withRouter } from "react-router-dom";
import {
  getCategories,
  getProduct,
  updateProduct,
  getPhoto,
} from "./helper/adminapicall";
import { isAutheticated } from "../auth/helper/index";
import { API } from "../backend";

const UpdateProduct = ({ match, history }) => {
  const { user, token } = isAutheticated();

  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    photo: "",
    categories: [],
    categoryName: "",
    categoryPhotoName: "",
    categoryPhoto: null,
    preview: null,
    loading: false,
    error: "",
    createdProduct: "",
    getaRedirect: false,
    formData: "",
  });

  const {
    name,
    description,
    price,
    stock,
    categories,
    loading,
    error,
    createdProduct,
    getaRedirect,
    formData,
    categoryName,
    categoryPhotoName,
    categoryPhoto,
    preview,
  } = values;

  const preload = (productId) => {
    getProduct(productId).then((data) => {
      //console.log(data);
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        console.log(data);
        getPhoto(productId)
          .then((photo) => {
            setValues({
              ...values,
              name: data.name,
              description: data.description,
              price: data.price,
              categoryName: data.category.name,
              stock: data.stock,
              categoryPhotoName: data.photoName,
              categoryPhoto: photo,
              formData: new FormData(),
            });
          })
          .catch((err) => console.log(err));
      }
    });
  };

  useEffect(() => {
    if (!categoryPhoto) {
      return;
    }
    console.log("INSIDE PREVIEW");
    // var reader = new FileReader();
    // reader.onload = (e) => {
    //   setValues({ ...values, preview: e.target.result, loading: true });
    // };

    // reader.readAsDataURL(categoryPhoto);
    const objectUrl = URL.createObjectURL(categoryPhoto);
    setValues({ ...values, preview: objectUrl, loading: true });

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [categoryPhoto]);

  console.log("PHOTO", categoryPhoto);
  console.log("PREVIEW", preview);
  console.log(values);

  const preloadCategories = () => {
    getCategories().then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        console.log(values);
        setValues({
          ...values,
          categories: data,
          loading: false,
        });
      }
    });
  };

  useEffect(() => {
    if (loading) {
      console.log("INSIDE CATEGORIES");
      preloadCategories();
    }
  }, [loading]);

  useEffect(() => {
    console.log("INSIDE PRELOAD");
    preload(match.params.productId);
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: "", loading: true });

    updateProduct(match.params.productId, user._id, token, formData).then(
      (data) => {
        if (data.error) {
          setValues({ ...values, error: data.error });
        } else {
          setValues({
            ...values,
            name: "",
            description: "",
            price: "",
            photo: "",
            stock: "",
            loading: false,
            createdProduct: data.name,
            getaRedirect: true,
          });
        }
      }
    );
  };

  useEffect(() => {
    if (getaRedirect) {
      setTimeout(() => {
        return history.push("/admin/dashboard");
      }, 2000);
    }
  }, [getaRedirect]);

  const handleChange = (name) => (event) => {
    event.persist();
    let value;
    if (name === "photo") {
      value = event.target.files[0];
      setValues({
        ...values,
        [name]: value,
        categoryPhotoName: value.name,
        categoryPhoto: value,
      });
    } else if (name === "category") {
      const select = event.target;
      value = select.children[select.selectedIndex].id;
      setValues({ ...values, [name]: value, categoryName: event.target.value });
    } else {
      value = event.target.value;
      setValues({ ...values, [name]: value });
    }
    formData.set(name, value);
  };

  const successMessage = () => (
    <div
      className="alert alert-success mt-3"
      style={{ display: createdProduct ? "" : "none" }}
    >
      <h4>{createdProduct} updated successfully</h4>
    </div>
  );

  const errorMessage = () => {
    return (
      <div className="row">
        <div className="col-md-6 offset-sm-3 text-left">
          <div
            className="alert alert-danger"
            style={{ display: error ? "" : "none" }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  };

  const createProductForm = () => (
    <form>
      <span className="d-inline-block mb-2">Post photo</span>
      <div className="form-group">
        <label for="image-upload" className="btn btn-block btn-success">
          <i className="fa fa-cloud-upload"></i> Image Upload
        </label>
        <input
          onChange={handleChange("photo")}
          id="image-upload"
          type="file"
          name="image"
          accept="image"
          style={{ display: "none" }}
        />
        {preview && (
          <img
            width="300"
            height="200"
            className="mr-2"
            src={preview}
            alt="Photo"
          />
        )}
        <span className="image-name">{categoryPhotoName}</span>
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("name")}
          name="photo"
          className="form-control"
          placeholder="Name"
          value={name}
        />
      </div>
      <div className="form-group">
        <textarea
          onChange={handleChange("description")}
          name="photo"
          className="form-control"
          placeholder="Description"
          value={description}
        />
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("price")}
          type="number"
          className="form-control"
          placeholder="Price"
          value={price}
        />
      </div>
      <div className="form-group">
        <select
          onChange={handleChange("category")}
          className="form-control"
          placeholder="Category"
          value={categoryName}
          required
        >
          <option value="Select">Select</option>
          {categories &&
            categories.map((cate, index) => (
              <option id={cate._id} key={index} value={cate.name}>
                {cate.name}
              </option>
            ))}
        </select>
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("stock")}
          type="number"
          className="form-control"
          placeholder="Stock"
          value={stock}
        />
      </div>

      <button
        type="submit"
        onClick={onSubmit}
        className="btn btn-outline-success mb-3"
      >
        Update Product
      </button>
    </form>
  );

  return (
    <Base
      title="Add a product here!"
      description="Welcome to product creation section"
      className="container bg-info p-4"
    >
      <Link to="/admin/dashboard" className="btn btn-md btn-dark mb-3">
        Admin Home
      </Link>
      <div className="row bg-dark text-white rounded">
        <div className="col-md-8 offset-md-2">
          {successMessage()}
          {errorMessage()}
          {createProductForm()}
        </div>
      </div>
    </Base>
  );
};

export default withRouter(UpdateProduct);
