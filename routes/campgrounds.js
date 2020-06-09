const express = require("express"),
	  router = express.Router({mergeParams: true}),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware");

//Index - show all campgrounds
router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//CREATE - add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res){
	const name = req.body.name;
    const image = req.body.image;
	const price = req.body.price;
    const desc = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newCampground = {name: name, image: image, price: price, description: desc, author: author};
	Campground.create(newCampground, function(err, campground){
		if(err){
			console.log(err);
		}
		else{
			req.flash("success", "Successfully added campground");
			res.redirect("/campgrounds");
		}			
	});
});

//SHOW - display more info of one campground
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT - show form to edit existing campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE - add edited campground to database
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY - delete a campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;
