import { useRef, useState } from "react";

import {
  ArrowLeft,
  ImagePlus,
  X,
  Save,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";


export default function AddCategory() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
    image: "",
  });

  const [errors, setErrors] = useState({});


  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }


  /* =======================================================
     AUTO SLUG
  ======================================================= */

  function handleNameChange(event) {
    const value =
      event.target.value;

    const generatedSlug =
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    setFormData((previous) => ({
      ...previous,
      name: value,
      slug: generatedSlug,
    }));

    setErrors((previous) => ({
      ...previous,
      name: "",
    }));
  }


  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image file."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setFormData((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }


  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  function removeImage() {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }


  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Category name is required.";
    }

    if (!formData.slug.trim()) {
      newErrors.slug =
        "Slug is required.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  }


  /* =======================================================
     SAVE CATEGORY
  ======================================================= */

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const existingCategories =
      JSON.parse(
        localStorage.getItem(
          "ashCategories"
        )
      ) || [];

    const duplicateName =
      existingCategories.some(
        (category) =>
          category.name
            ?.toLowerCase()
            .trim() ===
          formData.name
            .toLowerCase()
            .trim()
      );

    if (duplicateName) {
      setErrors({
        name:
          "A category with this name already exists.",
      });

      return;
    }

    const duplicateSlug =
      existingCategories.some(
        (category) =>
          category.slug
            ?.toLowerCase()
            .trim() ===
          formData.slug
            .toLowerCase()
            .trim()
      );

    if (duplicateSlug) {
      setErrors({
        slug:
          "A category with this slug already exists.",
      });

      return;
    }


    const newCategory = {
      id: `category-${Date.now()}`,

      name:
        formData.name.trim(),

      slug:
        formData.slug.trim(),

      description:
        formData.description.trim(),

      status:
        formData.status,

      image:
        formData.image,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };


    const updatedCategories = [
      ...existingCategories,
      newCategory,
    ];


    localStorage.setItem(
      "ashCategories",
      JSON.stringify(
        updatedCategories
      )
    );


    alert(
      "Category created successfully."
    );


    navigate("/categories");
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="product-form-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="product-form-heading">

        <div>

          <Link
            to="/categories"
            className="back-link"
          >
            <ArrowLeft size={15} />
            Back to Categories
          </Link>

          <p className="eyebrow">
            CATALOGUE
          </p>

          <h1>
            Add Category
          </h1>

          <p>
            Create a new jewellery catalogue
            category.
          </p>

        </div>

      </section>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="product-form-layout"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="product-form-main">


          {/* BASIC INFORMATION */}

          <section className="product-form-card">

            <div className="product-form-card-header">

              <div>

                <h3>
                  Category Information
                </h3>

                <p>
                  Add the basic details for
                  your category.
                </p>

              </div>

            </div>


            <div className="product-form-grid">


              {/* NAME */}

              <div className="form-field full-width">

                <label>
                  Category Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Bangles"
                  value={
                    formData.name
                  }
                  onChange={
                    handleNameChange
                  }
                  className={
                    errors.name
                      ? "input-error"
                      : ""
                  }
                />

                {errors.name && (
                  <small className="field-error">
                    {errors.name}
                  </small>
                )}

              </div>


              {/* SLUG */}

              <div className="form-field">

                <label>
                  Slug
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="slug"
                  placeholder="bangles"
                  value={
                    formData.slug
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    errors.slug
                      ? "input-error"
                      : ""
                  }
                />

                <small>
                  Used in the category URL.
                </small>

                {errors.slug && (
                  <small className="field-error">
                    {errors.slug}
                  </small>
                )}

              </div>


              {/* STATUS */}

              <div className="form-field">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {/* DESCRIPTION */}

              <div className="form-field full-width">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe this jewellery category..."
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                />

                <small>
                  A short description helps
                  organise and identify the
                  category.
                </small>

              </div>

            </div>

          </section>


          {/* IMAGE */}

          <section className="product-form-card">

            <div className="product-form-card-header">

              <div>

                <h3>
                  Category Image
                </h3>

                <p>
                  Add a visual image for this
                  category.
                </p>

              </div>

            </div>


            {formData.image ? (

              <div className="category-upload-preview">

                <img
                  src={
                    formData.image
                  }
                  alt="Category preview"
                />

                <button
                  type="button"
                  className="category-remove-image"
                  onClick={
                    removeImage
                  }
                >
                  <X size={16} />
                  Remove Image
                </button>

              </div>

            ) : (

              <button
                type="button"
                className="category-upload-box"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <ImagePlus
                  size={28}
                  strokeWidth={1.4}
                />

                <strong>
                  Upload Category Image
                </strong>

                <span>
                  JPG, PNG or WEBP
                </span>

              </button>

            )}


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={
                handleImageChange
              }
            />

          </section>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <aside className="product-form-sidebar">


          {/* PUBLISHING */}

          <section className="product-form-card">

            <div className="product-form-card-header">

              <div>

                <h3>
                  Publishing
                </h3>

                <p>
                  Control category visibility.
                </p>

              </div>

            </div>


            <label className="publish-option">

              <input
                type="radio"
                name="status"
                value="Active"
                checked={
                  formData.status ===
                  "Active"
                }
                onChange={
                  handleChange
                }
              />

              <div>

                <strong>
                  Active
                </strong>

                <span>
                  Category is visible and
                  available.
                </span>

              </div>

            </label>


            <label className="publish-option">

              <input
                type="radio"
                name="status"
                value="Inactive"
                checked={
                  formData.status ===
                  "Inactive"
                }
                onChange={
                  handleChange
                }
              />

              <div>

                <strong>
                  Inactive
                </strong>

                <span>
                  Category is hidden from
                  customers.
                </span>

              </div>

            </label>

          </section>


          {/* ACTIONS */}

          <section className="product-form-card">

            <button
              type="submit"
              className="save-product-btn"
            >
              <Save size={16} />
              Create Category
            </button>


            <Link
              to="/categories"
              className="cancel-product-btn"
            >
              Cancel
            </Link>

          </section>

        </aside>

      </form>

    </div>
  );
}