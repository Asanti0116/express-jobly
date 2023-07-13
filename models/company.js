"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Company {
  /* Create a company (from JSON data), update db, return new company data.
  * data should be: { handle, name, description, numEmployees, logoUrl }
  * => { handle, name, description, numEmployees, logoUrl }
  * Throws BadRequestError if company already in database.
  */
  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );

    const company = result.rows[0];
    return company;
  }

  /** Find all companies, accepts filters
   * => [{ handle, name, description, numEmployees, logoUrl }]
   * start with base query, add WHERE filters
  */
  static async findAll(filters = {}) {
    let query = `SELECT handle,
                        name,
                        description,
                        num_employees AS "numEmployees",
                        logo_url AS "logoUrl"
                FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    const { name, minEmployees, maxEmployees } = filters;

    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (minEmployees !== undefined) {
      queryValues.push(minEmployees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    if (maxEmployees !== undefined) {
      queryValues.push(maxEmployees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    query += " ORDER BY name";

    const companiesRes = await db.query(query, queryValues);
    // example ending query:
      // SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" 
      // FROM companies 
      // WHERE name ILIKE $1 AND num_employees >= $2 
      // ORDER BY name, 
      // ["%name%", numValue]
    return companiesRes.rows;
  }


  /* Given a company handle, return data about company.
   * => { handle, name, description, numEmployees, logoUrl, jobs }
   * Throws NotFoundError if not found.
   */
  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /* Update company data with passed in `data`.
   * Partial updates are OK using sqlForPartialUpdate
   * Data can include: {name, description, numEmployees, logoUrl}
   * => {handle, name, description, numEmployees, logoUrl}
   * Throws NotFoundError if not found.
   */
  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url"
        });
    const handleVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /* Delete given company from database; returns undefined.
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;