import Product from "../model/Product.js";

const sanitizeProduct = (p) => {
  if (!p) return null;
  const { _id, name, description, price, category, stock, image, createdBy, createdAt, updatedAt } = p;
  return { id: _id, name, description, price, category, stock, image, createdBy, createdAt, updatedAt };
};

// Create product (user or admin). Optional image upload with field name: image
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required", product: null });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const createdBy = req.user?.id || null;
    if (!createdBy) return res.status(401).json({ message: "Unauthorized", product: null });

    const product = await Product.create({ name, description, price, category, stock, image, createdBy });
    return res.status(201).json({ message: "product created", product: sanitizeProduct(product) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "server error", product: null });
  }
};

// Get all products (public)
export const getAllProductController = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log("user",req.user)
    return res.status(200).json({ message: "products fetched", products: products.map(sanitizeProduct) });
  } catch (e) {
    return res.status(500).json({ message: "server error", products: null });
  }
};

// Get product by id (public)
export const getProductByIdController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "product not found", product: null });
    return res.status(200).json({ message: "product fetched", product: sanitizeProduct(product) });
  } catch (e) {
    return res.status(500).json({ message: "server error", product: null });
  }
};

// Update product (owner or admin). Optional image upload
export const updateProductController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "product not found", product: null });

    const isOwner = product.createdBy?.toString() === req.user?.id;
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { name, description, price, category, stock } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    return res.status(200).json({ message: "product updated", product: sanitizeProduct(product) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "server error", product: null });
  }
};

// Delete product (owner or admin)
export const deleteProductController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "product not found" });

    const isOwner = product.createdBy?.toString() === req.user?.id;
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    await product.deleteOne();
    return res.status(200).json({ message: "product deleted" });
  } catch (e) {
    return res.status(500).json({ message: "server error" });
  }
};
