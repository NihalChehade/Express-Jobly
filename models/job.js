"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {
 
 /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * */
 static async create({title, salary, equity, company_handle}){
    const result = await db.query(
        `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle`,
        [
            title,
            salary,
            equity,
            company_handle        
        ],
    );
    const job = result.rows[0];
    return job;
 }

 /** Find all jobs.
   * Dynamically allow any, all or none of title, minSalary, hasEquity filtering
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

   static async findAll({ title, minSalary, hasEquity } = {}) {
    let baseQuery = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle 
                     FROM jobs`;

    let whereClauses = [];
    let queryValues = [];

    // if filtering is inculded  add the value to queryValues [], then add the condition for it to whereClauses []

    if (title) {
      queryValues.push(`%${title}%`);
      whereClauses.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereClauses.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === "true") {
      whereClauses.push(`equity > 0`);
    }
    
    //if there is conditions in whereClauses, then combine the where clause to the baseQuery
    if (whereClauses.length > 0) {
      baseQuery += " WHERE " + whereClauses.join(" AND ");
    }
    
    
    baseQuery += " ORDER BY title";
    const jobsRes = await db.query(baseQuery, queryValues);
    return jobsRes.rows;
  }



  /** Given a job by id, return data about the job.
   *
   * Returns {id, title, salary, equity, company_handle }
   *  
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
  }


}
module.exports=Job;