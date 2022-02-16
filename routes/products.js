const express = require("express");
const router = express.Router();
const { getProducts, getProductById } = require("../helpers");

module.exports = (db) => {
  router.get("/", async(req, res) => {
    const products = await getProducts(db);
    const templateVars = { products };

    if (req.session["user_id"]) {
      const userObj = req.session["user_id"];
      Object.assign(templateVars, { user_id: userObj });
    }
    res.render("products_index", templateVars);
  });

  router
    .get("/new", (req, res) => {
      if (req.session["user_id"] && req.session["user_id"].admin) {
        const templateVars = {
          user_id: req.session["user_id"],
        };
        res.render("products_new", templateVars);
        return;
      }
      res.send(`You must be an authorized user to access this.`);
    })

    .post("/new", (req, res) => {
      let isFeatured = false;
      if (req.body.featured) {
        isFeatured = true;
      }
      db.query(`INSERT INTO listings (title, owner_id, img_url, price, description, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [req.body.title, req.session["user_id"].id, req.body.img_url, req.body.price, req.body.description, isFeatured])
        .then((data) => {
          const record = data.rows[0];
          console.log(record);
          res.redirect('/');
        }).catch(error => {
          console.log(error);
        });
    });

  router.get("/:id", async(req, res) => {
    const productId = req.params.id;
    const product = await getProductById(db, productId);

    const templateVars = { product };

    if (req.session["user_id"]) {
      const userObj = req.session["user_id"];
      Object.assign(templateVars, { user_id: userObj });
    }
    console.log(templateVars);
    res.render("products_unique", templateVars);
  });

  return router;
};
