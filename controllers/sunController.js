const catchAsync = require("../utils/catchAsync");
const querystring = require("querystring");
const SunOrder = require("../models/sunOrderModel");
const GroupTicket = require("../models/groupTicketModel");
const Ticket = require("../models/ticketModel");
const { findDeselectedItem } = require("../helper/help");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");
const axios = require("axios");
const User = require("../models/userModel");

const getSunAuth = async () => {
  const authData = {
    client_id: "a080f7dc-f11a-4d95-a0a0-736c3e7f282b",
    client_secret: "Hks8Q~UjsdEo4rs-rVWPnck5rZDqCvnla3DIeaXR",
    grant_type: "client_credentials",
    scope:
      "https://sunworldb2cdev.onmicrosoft.com/c8163e2e-f64e-4d34-b604-2341607f8935/.default",
  };
  const doc = await axios.post(
    "https://sunworldb2cdev.b2clogin.com/sunworldb2cdev.onmicrosoft.com/B2C_1_ropc/oauth2/v2.0/token",
    querystring.stringify(authData)
  );
  // res.status(200).json({
  //   status: "success",
  //   data: doc.data.access_token,
  // });
  return doc.data.access_token;
};

exports.getOrderSun = factory.getAll(SunOrder);

exports.getReportSun = factoryBom.getAllReportSun(SunOrder);

exports.getAllSunSites = catchAsync(async (req, res, next) => {
  const access_token = await getSunAuth();
  const sunQuery = `?page=${req.query.current}&limit=${req.query.pageSize}`;
  const url = `${process.env.SUN_URL}/ota/site/listing`;
  const newUrl = url.concat(sunQuery);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "swg-subscription-key": process.env.swg,
    },
    url: newUrl,
  };
  const doc = await axios(options);
  const sunPagi = doc.data.paginationData;
  const pagi = {
    current: sunPagi.current,
    pageSize: sunPagi.numItemsPerPage,
    total: sunPagi.totalCount,
  };
  res.status(200).json({
    status: "success",
    data: doc.data.result,
    ...pagi,
  });
});

exports.getSiteProducts = catchAsync(async (req, res, next) => {
  const access_token = await getSunAuth();
  const url = `${process.env.SUN_URL}/ota/product/listing?siteCodes[]=${req.query.siteCodes}&date=${req.query.date}`;
  // const newUrl = url.concat(req.query.siteCodes);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "swg-subscription-key": process.env.swg,
    },
    url,
  };
  const doc = await axios(options);
  res.status(200).json({
    status: "success",
    data: doc.data.result,
  });
});

exports.createOrderSun = catchAsync(async (req, res, next) => {
  const filterArr = req.body.products.map((el) => el.productCode);
  const { sunName, siteCode } = req.body;

  const groupTicketDoc = await GroupTicket.find({ sku: { $in: filterArr } });

  const newDoc = groupTicketDoc.map((el) => el.sku);

  const missing = findDeselectedItem(filterArr, newDoc);

  if (missing.length) {
    res.status(400).json({
      status: "error",
      message: `Bạn chưa tạo mã vé: ${missing}`,
      // data: null,
    });
  } else {
    const access_token = await getSunAuth();
    const url = `${process.env.SUN_URL}/ota/order/create-order`;
    const optionsOrder = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "swg-subscription-key": process.env.swg,
      },
      url,
      data: {
        products: req.body.products,
      },
    };
    const orderDoc = await axios(optionsOrder);

    const orderCode = orderDoc.data.result[0].orderCode;
    const optionsGetOrder = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "swg-subscription-key": process.env.swg,
      },
      url: `${process.env.SUN_URL}/ota/order/get?orderCode=${orderCode}`,
    };

    const getOrderDoc = await axios(optionsGetOrder);

    await SunOrder.create({
      ...getOrderDoc.data.result,
      sunName: sunName,
      siteCode: siteCode,
      orderUser: req.user.email,
    });

    if (req.user.email === "vsttravel@gmail.com") {
      await User.findByIdAndUpdate(req.user.id, {
        moneny: req.user.moneny - getOrderDoc.data.result.totalOrderPrice,
      });
    }

    const ticketArr = getOrderDoc.data.result.items;
    for (let i = 0; i < ticketArr.length; i++) {
      const ticketImportArr = ticketArr[i].products.ticket.map((el) => {
        return {
          name: "Vé tham quan",
          groupTicket: groupTicketDoc[i]._id,
          serial: el.ticketNumber,
          purchaseId: orderCode,
          activatedDate: el.validDateFrom,
          expiredDate: el.validDateTo,
          importUser: req.user.email,
        };
      });
      await Ticket.create(ticketImportArr);
    }

    res.status(200).json({
      status: "success",
      // data: null,
    });
  }
});
