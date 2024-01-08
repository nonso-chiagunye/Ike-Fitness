// Use this class to enable different features on the API, like filter, sort, limit fields and manage pages.
class APIQueries {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // Create a new object (copy) out of the query string
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // Exclude special field names in query string
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // Replace these operators with their equivalent MongoDB format (gte = $gte, gt = $gt etc)

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // If sort is in the query string
      const sortBy = this.queryString.sort.split(',').join(' '); // When sorting with multiple keys (sort=price,difficulty)
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // By default, sort by creation time
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // When using 'fields' to limit the fields to fetch
      const fields = this.queryString.fields.split(',').join(' '); // Fetching multiple comma-seperated fields (fields=name,goal,price etc)
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // If no field is specified, fetch all except the mongoose-added __v field.
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // Convert specified page to number
    const limit = this.queryString.limit * 1 || 100; // Convert the specified page limit to number
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIQueries;
