const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /jobs route tests */
describe("POST /jobs", () => {
  test("POST to jobs works for admins", async () => {
    const res = await request(app)
      .post("/jobs")
      .send({
        "title": "New Job",
        "salary": 90000,
        "equity": 0.05,
        "companyHandle": "c1",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 90000,
        equity: "0.05",
        companyHandle: "c1",
      },
    });
  });

  test("return 401 unauthorized for non-admins", async () => {
    const res = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: 90000,
        equity: "0.05",
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("return 400 bad request with invalid data", async () => {
    const res = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: "invalid_salary",
        equity: "0.05",
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(400);
  });
}); 

/************************************** GET /jobs route tests */
describe("GET /jobs", () => {
  test("get jobs works as intended", async () => {
    const res = await request(app).get("/jobs");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
            id: expect.any(Number),
            title: "Job2",
            salary: 150000,
            equity: "0.2",
            companyHandle: "c2",
          },
      ],
    });
  });

  test("get jobs works with filters", async () => {
    const res = await request(app).get("/jobs?title=Job1&minSalary=90000&hasEquity=true");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id route tests */
describe("GET /jobs/:id", () => {
  test("get jobs works as intended", async () => {
    const res = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Job1",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("return 404 not found for no such job", async () => {
    const res = await request(app).get("/jobs/0");
    expect(res.statusCode).toEqual(404);
  });
});

/************************************** GET /jobs/companies/:handle route tests */
describe("GET /jobs/companies/:handle", () => {
    test("get jobs works for anon user (none admin)", async () => {
      const res = await request(app).get("/jobs/companies/c1");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        jobs: [
          {
            id: expect.any(Number),
            title: "Job1",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
          }
        ],
      });
    });

    test("get jobs doesn't work for none existant company", async () => {
        const res = await request(app).get("/jobs/companies/nope");
        expect(res.statusCode).toEqual(404);
      });  

  });

/************************************** PATCH /jobs/:id route tests */
describe("PATCH /jobs/:id", () => {
  test("patch works for admins as intended", async () => {
    const res = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "Updated Job",
        salary: 95000,
        equity: 0.2,
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Updated Job",
        salary: 95000,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("return 401 unauthorized for non-admins", async () => {
    const res = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "Updated Job",
        salary: 95000,
        equity: "0.2",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("return 400 bad request for patch with invalid data", async () => {
    const res = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "Updated Job",
        salary: "invalid_salary",
        equity: "0.2",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("return 400 if job not found / job doesn't exist", async () => {
    const res = await request(app)
      .patch("/jobs/0")
      .send({
        title: "Updated Job",
        salary: 95000,
        equity: "0.2",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(400);
  });
});

describe("DELETE /jobs/:id", () => {
  test("works as intended for admins", async () => {
    const res = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ deleted: `${testJobIds[0]}` });
  });

  test("return 401, unauthorized for non-admins", async () => {
    const res = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("return 404, not found if no such job exists", async () => {
    const res = await request(app)
      .delete("/jobs/0")
      .set("authorization", `Bearer ${a1Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

 

// study notes:
// // below doesn't work because it is not inside of an async function
// console.log(`jobId1: ${jobId1}`)
// beforeAll, beforeEach, afterAll, afterEach are all async functions by default 
//          no need to specify async before use here