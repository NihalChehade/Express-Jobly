"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  AdminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "new-job",
    salary: 25000,
    equity: 0,
    company_handle: "c1"
  };

  test("ok for loggedIn Admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: 4,
        title: "new-job",
        salary: 25000,
        equity: "0",
        company_handle: "c1"
      },
    });
  });

  test("fails for non Admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            salary: 25000,
            equity: 0            
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new-job",
            salary: "thousand",
            equity: 0,
            company_handle: 4
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
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
              }
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
  
  test("works: title filter", async () => {
    const res = await request(app).get("/jobs?title=2");
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs.length).toBe(1);
    expect(res.body).toEqual({
      jobs:
          [
            {
                id: 2,
                title :'j2' ,                          
                salary: 15000,
                equity:"0",
                company_handle:'c2',
              }
          ],
    });
  });

  test("works: minSalary filter", async () => {
    const res = await request(app).get("/jobs?minSalary=15000");
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs.length).toBe(2);
    expect(res.body).toEqual({
      jobs:
          [
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
              }
          ],
    });
  });

  test("works: hasEquity filter is true", async () => {
    const res = await request(app).get("/jobs?hasEquity=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs.length).toBe(1);
    expect(res.body).toEqual({
      jobs:
          [
            {
                id: 3,
                title :'j3' ,
                salary: 20000,
                equity:"0.5",
                company_handle:'c3',
              }
          ]
    });
  });

  
  test("works: hasEquity is false", async () => {
    const res = await request(app).get("/jobs?hasEquity=false");
    expect(res.body).toEqual({
        jobs:
            [
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
                  }
            ],
      });
    });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title : 'j1',
        salary:10000 ,
        equity:"0",
        company_handle:'c1',
      },
    });
  });

  

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/10`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for Admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "J1-new",
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title : 'J1-new',
        salary:10000 ,
        equity:"0",
        company_handle:'c1',
      },
    });
  });

  test("unauth for non Admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "J1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "J1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/60`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          company_handle: "c1-new",
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: "invalid"
        })
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });
  test("unauth for non admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/25`)
        .set("authorization", `Bearer ${AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

