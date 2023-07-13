"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { NotFoundError, BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const Job = require("../models/job");
const router = express.Router();


/* Create new user (not registration route, this is for admins)
POST /users { user }  => {user: { username, firstName, lastName, email, isAdmin }, token }
Authorization required: admin
*/
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/* Apply to a new job
POST /users/:username/jobs/:id => { applied: jobId }
Authorization required: admin or correct user
*/
router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {

    const { username, id } = req.params;
    // Check if the user exists
        // note : error handling for below done on Models
    const user = await User.get(username);
    const job = await Job.get(id);
    const application = await User.applyToJob(username, id);
    return res.json({ applied: application.jobId });
  } catch (err) {
    return next(err);
  }
});

/* Returns list of all users
GET /users => { users: [ {user1}, {user2}, ... ] }
Authorization required: admin
*/
router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/* Retreive information on specific user
GET users/[username] => { user: {username, firstName, lastName, email, isAdmin, jobApps} }
Authorization required: admin or correct user
*/
router.get("/:username", ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/* Update user information
PATCH users/[username] { any of: firstName, lastName, password, email } => { user }
Authorization required: admin or correct user
*/
router.patch("/:username", ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/* Delete user
DELETE users/[username]  =>  { deleted: username }
Authorization required: admin or correct user
*/
router.delete("/:username", ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;


// To Do Outside of project requirements:
// DELETE for existng applications