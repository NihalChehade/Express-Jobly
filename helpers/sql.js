const { BadRequestError } = require("../expressError");

//  Dynamically generates an SQL update query for partially updating records in DB.
//  given :
//  dataToUpdate Object that holds key-value pairs of columns to be updated and their new values.
//  jsToSql Object that maps property names to their corresponding SQL column names.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
