const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.groupByFuc = (arr) =>
  // arr
  {
    // const arr = [
    //   {
    //     exportUser: "admin",
    //     groupTicket: {
    //       _id: "111",
    //     },
    //     quantity: 1,
    //   },
    //   {
    //     exportUser: "admin",
    //     groupTicket: {
    //       _id: "111",
    //     },
    //     quantity: 2,
    //   },
    //   {
    //     exportUser: "admin",
    //     groupTicket: {
    //       _id: "111",
    //     },
    //     quantity: 2,
    //   },
    //   {
    //     exportUser: "admin",
    //     groupTicket: {
    //       _id: "222",
    //     },
    //     quantity: 4,
    //   },
    //   {
    //     exportUser: "admin",
    //     groupTicket: {
    //       _id: "222",
    //     },
    //     quantity: 4,
    //   },
    //   {
    //     exportUser: "xuanbao",
    //     groupTicket: {
    //       _id: "111",
    //     },
    //     quantity: 1,
    //   },
    //   {
    //     exportUser: "xuanbao",
    //     groupTicket: {
    //       _id: "111",
    //     },
    //     quantity: 1,
    //   },
    //   {
    //     exportUser: "xuanbao",
    //     groupTicket: {
    //       _id: "222",
    //     },
    //     quantity: 0,
    //   },
    // ];
    // return (result = [
    //   ...arr
    //     .reduce((r, o, b) => {
    //       console.log(r);
    //       const key = o.exportUser + "-" + o.groupTicket._id;

    //       const item =
    //         r.get(key) ||
    //         Object.assign({}, o, {
    //           quantity: 0,
    //         });
    //       // console.log(item._doc);
    //       item.quantity += o.quantity;

    //       return r.set(key, item);
    //     }, new Map())
    //     .values(),
    // ]);
    const result = Object.values(
      arr.reduce(function (r, e) {
        const key = e.exportUser + "|" + e.groupTicket;
        if (!r[key]) r[key] = e;
        else {
          r[key].quantity += e.quantity;
          r[key].subTotal += e.subTotal;
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
