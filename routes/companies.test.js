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
  a1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies route tests */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("create new company is ok for admins", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newCompany)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          ...newCompany,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies route tests */

describe("GET /companies", function () {
  test("get works for anon user", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
          [
            {
              handle: "c1",
              name: "C1",
              description: "Desc1",
              numEmployees: 1,
              logoUrl: "http://c1.img",
            },
            {
              handle: "c2",
              name: "C2",
              description: "Desc2",
              numEmployees: 2,
              logoUrl: "http://c2.img",
            },
            {
              handle: "c3",
              name: "C3",
              description: "Desc3",
              numEmployees: 3,
              logoUrl: "http://c3.img",
            },
          ],
    });
  });

  test("get companies works with minEmployees filter", async function () {
    const resp = await request(app).get("/companies?minEmployees=2");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("get companies works with maxEmployees filter", async function () {
    const resp = await request(app).get("/companies?maxEmployees=2");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
      ],
    });
  });

  test("get companies works with both minEmployees and maxEmployees filters", async function () {
    const resp = await request(app).get("/companies?minEmployees=1&maxEmployees=2");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
      ],
    });
  });

  test("get companies bad request with minEmployees greater than maxEmployees", async function () {
    const resp = await request(app).get("/companies?minEmployees=3&maxEmployees=2");
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: "minEmployees cannot be greater than maxEmployees",
        status: 400,
      },
    });
  });

  // there's no normal failure event which will cause this route to fail ---
  // thus making it hard to test that the error-handler works with it. 
  // below is a test that forces an error to occur in the route
  test("test 500 error handler works by forcing next() error", async function () {
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("get companies works with name filter", async function () {
    const resp = await request(app).get("/companies?name=C1");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      ],
    });
  });

  test("get companies works with name and minEmployees filters", async function () {
    const resp = await request(app).get("/companies?name=C&minEmployees=2");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("get companies works with name and maxEmployees filters", async function () {
    const resp = await request(app).get("/companies?name=C&maxEmployees=2");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
      ],
    });
  });

  test("get companies works with all filters", async function () {
    const resp = await request(app).get("/companies?name=C&minEmployees=1&maxEmployees=3");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("get companies returns an empty array when no matching filters found", async function () {
    const resp = await request(app).get("/companies?name=Nonexistent&minEmployees=100&maxEmployees=200");
    expect(resp.body).toEqual({ companies: [] });
  });

});

/************************************** GET /companies/:handle route tests */

describe("GET /companies/:handle", function () {
  test("get handle works for anon user", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("get handle works for authorized user", async function () {
    const resp = await request(app)
        .get(`/companies/c1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("get handle works for anon user, get company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("get handle works for non-admin user, get company w/o jobs", async function () {
    const resp = await request(app)
        .get(`/companies/c2`)
        .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({
        company: {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
      });
  });


  test("return 404 not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle routes test */

describe("PATCH /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("return 401 unauth for anon user", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("return 404 not found on no such company patch", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("return 400 bad request on handle change attempt, shouldn't allow handle changes", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("return 400 on logo url schema violation", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle route tests */

describe("DELETE /companies/:handle", function () {
  test("delete route works for admins", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("401 returned for anon user", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("404 returned for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

describe("401 return for unauthorized access for non-admin users", function () {
  test("non-admin user cannot create a new company", async function () {
    const newCompany = {
      handle: "new",
      name: "New Co",
      description: "New test company",
      numEmployees: 10,
      logoUrl: "http://new.img",
    };
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u1Token}`); 
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: { message: "Admin privileges required", status: 401 },
    });
  });
});


test("non-admin user cannot update a company", async function () {
  const updatedCompany = {
    name: "Updated Co",
    description: "Updated test company",
    numEmployees: 15,
    logoUrl: "http://updated.img",
  };
  const resp = await request(app)
    .patch("/companies/c1")
    .send(updatedCompany)
    .set("authorization", `Bearer ${u1Token}`); 
  expect(resp.statusCode).toEqual(401);
  expect(resp.body).toEqual({
    error: { message: "Admin privileges required", status: 401 },
  });
});

test("non-admin user cannot delete a company", async function () {
  const resp = await request(app)
    .delete("/companies/c1")
    .set("authorization", `Bearer ${u1Token}`); 
  expect(resp.statusCode).toEqual(401);
  expect(resp.body).toEqual({
    error: { message: "Admin privileges required", status: 401 },
  });
});