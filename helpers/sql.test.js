const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
  test("generates a proper SQL query for partial update", () => {
    const dataToUpdate = {
      firstName: "John",
      lastName: "Doe",
      age: 25,
    };

    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
    };

    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2, "age"=$3');
    expect(values).toEqual(["John", "Doe", 25]);
  });

  test("throws a BadRequestError when dataToUpdate is empty", () => {
    const dataToUpdate = {};

    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
    };

    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow(BadRequestError);
  });
});