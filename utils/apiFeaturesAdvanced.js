class APIFeaturesAdvanced {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["current", "pageSize", "sort", "fields", "name", "bigTicket", "allOfTicket"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|regex)\b/g, (match) => {
      return `$${match}`;
    });

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  pagination() {
    const current = this.queryString.current * 1 || 1;
    const pageSize = this.queryString.pageSize * 1 || 10;
    const skip = (current - 1) * pageSize;

    this.query = this.query.skip(skip).limit(pageSize);

    return this;
  }
}

module.exports = APIFeaturesAdvanced;
