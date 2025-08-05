const Listing = require("../models/listing.js");
require("dotenv").config();
const axios = require("axios");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;
  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", { allListings, category: category || "All" });
};

module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
 
  res.render("listings/show.ejs", { listing });
};

module.exports.create = async (req, res, next) => {
  const MAP_TOKEN = process.env.MAP_TOKEN;
  let url = req.file.path;
  let filename = req.file.filename;

  const location = req.body.listing.location;
  const encodedLocation = encodeURIComponent(location);
  const maptilerUrl = `https://api.maptiler.com/geocoding/${encodedLocation}.json?limit=1&key=${MAP_TOKEN}`;

  const response = await axios.get(maptilerUrl);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.data.features[0].geometry;

  let savedListing=await newListing.save();
  console.log(savedListing);
  
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  previewImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, previewImageUrl });
};

module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.search = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    req.flash("error", "Search query missing.");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    title: { $regex: q, $options: "i" }, // case-insensitive match
  });

  res.render("listings/index.ejs", {
    allListings: listings,
    category: null,
  });
};