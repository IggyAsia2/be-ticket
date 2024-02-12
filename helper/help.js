exports.FilterCountOrder = (filter, queryObj, addOn) => {
  let source = { ...filter };
  const dest = { ...queryObj };
  const excludedFields = ["current", "pageSize", "sort", "bigTicket"];
  if (addOn && addOn.length) {
    addOn.forEach((item) => {
      excludedFields.push(item);
    });
  }
  excludedFields.forEach((el) => delete dest[el]);
  Object.assign(source, dest);

  // Tranformer
  let queryStr = JSON.stringify(source);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|regex)\b/g, (match) => {
    return `$${match}`;
  });

  source = JSON.parse(queryStr);

  return source;
};

exports.FilterCount = (filter, queryObj, addOn) => {
  let source = { ...filter };
  const dest = { ...queryObj };
  const excludedFields = ["current", "pageSize", "sort"];
  if (addOn && addOn.length) {
    addOn.forEach((item) => {
      excludedFields.push(item);
    });
  }
  excludedFields.forEach((el) => delete dest[el]);
  Object.assign(source, dest);

  // Tranformer
  let queryStr = JSON.stringify(source);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|regex)\b/g, (match) => {
    return `$${match}`;
  });

  source = JSON.parse(queryStr);

  return source;
};

exports.findDeselectedItem = (array1, array2) => {
  return array1.filter(
    (
      (i) => (a) =>
        a !== array2[i] || !++i
    )(0)
  );
};

exports.sortArray = (a, b) => {
  return a.stt - b.stt;
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
