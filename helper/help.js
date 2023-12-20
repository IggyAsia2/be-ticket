exports.FilterCount = (filter, queryObj, addOn) => {
  let source = { ...filter };
  const dest = { ...queryObj };
  const excludedFields = ["current", "pageSize"];
  if (addOn && addOn.length) {
    addOn.forEach((item) => {
      excludedFields.push(item);
    });
  }
  excludedFields.forEach((el) => delete dest[el]);
  Object.assign(source, dest);

  // Tranformer
  let queryStr = JSON.stringify(source);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => {
    return `$${match}`;
  });

  source = JSON.parse(queryStr);

  return source;
};

//     const queryObj = { ...this.queryString };
//     const excludedFields = ["current", "pageSize", "sort", "fields", "name", "bigTicket"];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // 1B) Advanced filtering

//     let queryStr = JSON.stringify(queryObj);

//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => {
//       return `$${match}`;
//     });

//     this.query = this.query.find(JSON.parse(queryStr));
