const { BadRequestError } = require("../expressError");

// Generates a SQL query for partial update of an object in the database.
// Accepts two arguments:
    // dataToUpdate - A object containing key-value pairs to be updated in the database.
    // Example: {firstName: 'Aliya', age: 32}
    // jsToSql - An object that maps JavaScript property names to their corresponding SQL column names.
    // Example: {firstName: 'first_name', age: 'age'}
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // extracts the keys from the dataToUpdate object into an array
  const keys = Object.keys(dataToUpdate);
  // If the dataToUpdate object is empty throw error stating "no data"
  if (keys.length === 0) throw new BadRequestError("No data");
  //Map over the keys array and return a new array containing the SQL query string for each key-value pair.
      // Example, keys = ['firstName', 'age']  jsToSql = {firstName: 'first_name', age: 'age'}
      //  cols would be ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      // jsToSql[colName] || colName} - If the key exists in the jsToSql object, use the value from the jsToSql object.
      // Otherwise, use the key from the dataToUpdate object (colName)
      // Example: jsToSql['firstName'] = 'first_name' || 'firstName' = 'first_name'
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
      // Note: very important to ensure jsToSql contains the correct sql columns,
        // query may fail if colName is not a valid column name in the database.
  );
  // return an object containing the generated SQL query string and an array of the updated values.
  return {
    // setCols: String - A SQL query string with placeholders for the values to be updated.
        // example- setCols= "first_name"=$1, "age"=$2
    setCols: cols.join(", "),
    // values: Array - An array of the values to be updated in the order they appear in the query string.
        // example- values= ['Aliya', 32]
    values: Object.values(dataToUpdate),
  };
}
module.exports = { sqlForPartialUpdate };