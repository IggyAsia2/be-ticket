const catchAsync = require("../utils/catchAsync");
const querystring = require("querystring");
const SunOrder = require("../models/sunOrderModel");
const factory = require("./handlerFactory");
const axios = require("axios");

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
  const url = `${process.env.SUN_URL}/ota/product/listing?siteCodes[]=`;
  const newUrl = url.concat(req.query.siteCodes);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "swg-subscription-key": process.env.swg,
    },
    url: newUrl,
  };
  const doc = await axios(options);
  res.status(200).json({
    status: "success",
    data: doc.data.result,
  });
});

exports.createOrderSun = catchAsync(async (req, res, next) => {
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

  // console.log(orderDoc.data.result[0].orderCode);

  const optionsGetOrder = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "swg-subscription-key": process.env.swg,
    },
    url: `${process.env.SUN_URL}/ota/order/get?orderCode=${orderDoc.data.result[0].orderCode}`,
  };

  const getOrderDoc = await axios(optionsGetOrder);

  await SunOrder.create({
    ...getOrderDoc.data.result,
    orderUser: req.user.email,
  });

  res.status(200).json({
    status: "success",
    data: null,
  });
});
