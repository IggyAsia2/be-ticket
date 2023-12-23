const catchAsync = require("../utils/catchAsync");
const querystring = require("querystring");
const axios = require("axios");

exports.setGroupTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.groupTicket) req.body.groupTicket = req.params.groupTicket;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

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

exports.getAllTickets = catchAsync(async (req, res, next) => {
  const access_token = await getSunAuth();
  const sunQuery = `?page=${req.query.current}&limit=${req.query.pageSize}`
  const url = `${process.env.SUN_URL}/ota/site/listing`
  const newUrl = url.concat(sunQuery)
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
    ...pagi
  });
});
