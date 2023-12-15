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
  return source;
};
