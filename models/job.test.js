"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");


let jobId1;
let jobId2;


beforeAll(async () => {
    const jobIds = await commonBeforeAll();
    jobId1 = jobIds.jobId1;
  });
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create job tests */
describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 50000,
    equity: "0.1",
    companyHandle: "c1",
  };

  test("creating new job works works as intended", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll job tests */
describe("findAll", function () {
  test("find all jobs with no filter applied works", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
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
    ]);
  });

  test("find all jobs works with title filter", async function () {
    const jobs = await Job.findAll({ title: "job" });
    expect(jobs).toEqual([
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
    ]);
  });

  test("find all jobs works with minSalary filter", async function () {
    const jobs = await Job.findAll({ minSalary: 120000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 150000,
        equity: "0.2",
        companyHandle: "c2",
      },
    ]);
  });

  test("find all jobs works with hasEquity filter", async function () {
    const jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
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
    ]);
  });

  test("find all jobs works with all filters", async function () {
    const jobs = await Job.findAll({ title: "job", minSalary: 120000, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 150000,
        equity: "0.2",
        companyHandle: "c2",
      },
    ]);
  });
});

/************************************** get job with id tests */
describe("get", function () {
  test("get job with id works", async function () {
    const job = await Job.get(jobId1);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Job1",
      salary: 100000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });
  
  test("job not found if no such job", async function () {
    try {
      await Job.get(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** get jobs from handle tests */
describe("getJobsFromHandle", function () {
    test("getJobsFromHandle works as intended", async function () {
      let jobs = await Job.getJobsFromHandle("c1");
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1",
        }
      ]);
    });
  
    test("job not found if no such company", async function () {
        try {
            await Job.getJobsFromHandle("nope");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
        });
  });
  
/************************************** update job tests */
describe("update", function () {
    const updateData = {
      title: "Updated Job",
      salary: 120000,
      equity: "0.15",
    };
  
    test("update job works as intended", async function () {
      const job = await Job.update(jobId1, updateData);
      expect(job).toEqual({
        id: expect.any(Number),
        companyHandle: "c1",
        ...updateData,
      });
    });
  
    test("job not found if no such job exists", async function () {
      try {
        await Job.update(0, updateData);
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("return bad request if no data", async function () {
      try {
        await Job.update(jobId1, {});
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
  

/************************************** remove job tests */
describe("remove", function () {
    test("remove works as intended", async function () {
      await Job.remove(jobId1);
      const res = await db.query(
        "SELECT id FROM jobs WHERE id = 1"
      );
      expect(res.rows.length).toEqual(0);
    });
  
    test("return not found if no such job", async function () {
      try {
        await Job.remove(0);
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});
  