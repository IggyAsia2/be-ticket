const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.groupByFunc = (arr) => {
  const result = Object.values(
    arr.reduce(function (r, e) {
      const key = e.exportUser + "|" + e.groupTicket;
      if (!r[key]) r[key] = e;
      else {
        r[key].quantity += e.quantity;
        r[key].subTotal += e.subTotal;
        r[key].discountSubtotal += e.discountSubtotal;
      }
      return r;
    }, {})
  );
  result.sort((a, b) => {
    const nameA = a.exportUser;
    const nameB = b.exportUser;
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }

    // names must be equal
    return 0;
  });
  return result;
};

exports.groupSunReportByFunc = (arr) => {
  const result = Object.values(
    arr.reduce(function (r, e) {
      // const key = e.orderUser + "|" + e.sunName + "|" + e.siteCode;
      const key = e.orderUser + "|" + e.siteCode;
      if (!r[key]) r[key] = e;
      else {
        r[key].totalOrderPrice += e.totalOrderPrice;
        r[key].items.push(...e.items);
      }
      return r;
    }, {})
  );
  result.sort((a, b) => {
    const nameA = a.orderUser;
    const nameB = b.orderUser;
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }

    // names must be equal
    return 0;
  });

  const newResult = result.map((el) => {
    const rebel = Object.values(
      el.items.reduce(function (r, e) {
        const key = e.products.productCode;
        if (!r[key]) r[key] = e;
        else {
          r[key].products.quantity += e.products.quantity;
        }
        return r;
      }, {})
    );
    return {
      ...el._doc,
      items: rebel,
    };
  });
  return newResult;
};

exports.getUserId = async (bear) => {
  let token;
  if (bear && bear.startsWith("Bearer")) {
    token = bear.split(" ")[1];
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  return userId;
};
