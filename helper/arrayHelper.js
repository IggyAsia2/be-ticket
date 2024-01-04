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
      const key = e.orderUser;
      if (!r[key]) r[key] = e;
      else {
        const emti = [...r[key].items];
        const tempArr = [];
        const emti2 = e.items;

        for (let i = 0; i < emti.length; i++) {
          for (let j = 0; j < emti2.length; j++) {
            if (
              emti[i].products.productCode === emti2[j].products.productCode
            ) {
              emti[i].products.quantity += emti2[j].products.quantity;
            } 
            else {
              r[key].items = [...emti, emti2[j]];
              // console.log(...emti2[j]);
              // emti.push(emti2[j]);
            }
          }
        }
        // r[key].items = [...emti]
        // r[key].quantity += e.quantity;
        // r[key].subTotal += e.subTotal;
        // r[key].discountSubtotal += e.discountSubtotal;
      }
      return r;
    }, {})
  );
  // result.sort((a, b) => {
  //   const nameA = a.orderUser;
  //   const nameB = b.orderUser;
  //   if (nameA < nameB) {
  //     return 1;
  //   }
  //   if (nameA > nameB) {
  //     return -1;
  //   }

  //   // names must be equal
  //   return 0;
  // });
  return result;
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
