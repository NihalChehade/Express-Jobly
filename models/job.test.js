"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new-job",
    salary: 25000,
    equity: 0,
    company_handle: "c1"
  };

  test("works", async function () {
    await Job.create(newJob);
    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new-job'`);
    expect(result.rows).toEqual([
      {
        id: 4,
        title: "new-job",
        salary: 25000,
        equity: "0",
        company_handle: "c1"
      },
    ]);
  });

  
});

/************************************** findAll */
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title : 'j1',
        salary:10000 ,
        equity:"0",
        company_handle:'c1',
      },
      {
        id: 2,
        title :'j2' ,                          
        salary: 15000,
        equity:"0",
        company_handle:'c2',
      },
      {
        id: 3,
        title :'j3' ,
        salary: 20000,
        equity:"0.5",
        company_handle:'c3',
      },
    ]);
  });

  test("works: title filter", async () => {
    const jobs = await Job.findAll({ title: "1" });
    expect(jobs.length).toBe(1);
    expect(jobs[0].company_handle).toBe("c1");
  });

  test("works: minSalary filter", async () => {
    const jobs = await Job.findAll({ minSalary: 15000 });
    expect(jobs.length).toBe(2);
    expect(jobs.map(c => c.company_handle)).toEqual(["c2", "c3"]);
  });

  test("works: hasEquity filter", async () => {
    const jobs = await Job.findAll({ hasEquity: "true" });
    expect(jobs.length).toBe(1);
    expect(jobs[0].company_handle).toBe("c3");
  });

  
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(2);
    expect(job).toEqual({
        id: 2,
        title :'j2' ,                          
        salary: 15000,
        equity:"0",
        company_handle:'c2',
      });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(50);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 17000,
    equity: 0.9
  };

  test("works", async function () {
    let job = await Job.update(2, updateData);
    expect(job).toEqual({
        id: 2,
        title: "New",
        salary: 17000,
        equity: "0.9",
        company_handle:'c2'
        
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 2`);
    expect(result.rows).toEqual([{
     id: 2,
     title: "New",
     salary: 17000,
     equity: "0.9",
     company_handle:"c2"
    }]);
  });

  

  test("not found if no such job", async function () {
    try {
      await Job.update(60, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(3);
    const res = await db.query(
        "SELECT title FROM jobs WHERE id=3");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(40);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
