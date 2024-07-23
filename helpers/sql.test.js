const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
  test("works: data with jsToSql mapping", () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    
    expect(setCols).toEqual('"first_name"=$1, "age"=$2');
    expect(values).toEqual(['Aliya', 32]);
  });

  test("works: data without jsToSql mapping", () => {
    const dataToUpdate = { lastName: 'Smith', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    
    expect(setCols).toEqual('"lastName"=$1, "age"=$2');
    expect(values).toEqual(['Smith', 32]);
  });

  test("throws BadRequestError if no data", () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name' };
    
    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql))
      .toThrow(BadRequestError);
  });
});