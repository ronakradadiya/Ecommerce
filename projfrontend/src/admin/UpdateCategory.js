import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link, withRouter } from "react-router-dom";
import { getCategory, updateCategory } from "./helper/adminapicall";
import { isAutheticated } from "../auth/helper";

const UpdateCategory = ({ match, history }) => {
  const { user, token } = isAutheticated();

  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [getaRedirect, setRedirect] = useState(false);

  const preload = (categoryId) => {
    getCategory(categoryId).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setName(data.name);
      }
    });
  };

  useEffect(() => {
    if (getaRedirect) {
      setTimeout(() => {
        return history.push("/admin/categories");
      }, 2000);
    }
  }, [getaRedirect]);

  useEffect(() => {
    preload(match.params.categoryId);
  }, []);

  const successMessage = () => (
    <div
      className="alert alert-success mt-3"
      style={{ display: success ? "" : "none" }}
    >
      <h4>category updated successfully</h4>
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

  const handleChange = (event) => {
    setError("");
    setName(event.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateCategory(match.params.categoryId, user._id, token, { name })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(true);
          setError(false);
          setRedirect(true);
        }
      })
      .catch((err) => console.log(err));
  };

  const myCategoryForm = () => (
    <form>
      <div className="form-group">
        <p className="lead">Enter the category</p>
        <input
          type="text"
          className="form-control my-3"
          onChange={handleChange}
          value={name}
          autoFocus
          required
        />
        <button onClick={onSubmit} className="btn btn-outline-info">
          Update Category
        </button>
      </div>
    </form>
  );

  return (
    <Base
      title="Update a category here!"
      description="Welcome to category updated section"
      className="container bg-info p-4"
    >
      <Link to="/admin/dashboard" className="btn btn-md btn-dark mb-3">
        Admin Home
      </Link>
      <div className="row bg-dark text-white rounded">
        <div className="col-md-8 offset-md-2">
          {successMessage()}
          {errorMessage()}
          {myCategoryForm()}
        </div>
      </div>
    </Base>
  );
};

export default withRouter(UpdateCategory);
