const { CronJob } = require("cron");
const Order = require("../models/orderModer");
const Ticket = require("../models/ticketModel");

exports.autoUpdateOrder = (times) =>
  new CronJob(
    `0 */${times/2} * * * *`, // cronTime
    async function () {
      const newDate = new Date();
      // const diffMinute = (val) => (newDate - new Date(val)) / 1000;
      // const minutes = (val) => Math.floor(diffMinute(val) / 60);
      // const seconds = (val) => Math.round(diffMinute(val) - minutes(val) * 60);
      const doc = await Order.find(
        {
          state: "Pending",
          createdAt: { $lte: new Date(newDate.getTime() - times * 60000) },
        },
        "state allOfTicket createdAt"
      );

      for (let i = 0; i < doc.length; i++) {
        for (let j = 0; j < doc[i].allOfTicket.length; j++) {
          const ticketArr = doc[i].allOfTicket;
          await Ticket.findByIdAndUpdate(ticketArr[j].id, {
            state: "Pending",
            issuedDate: null,
          });
        }
        await Order.findByIdAndUpdate(doc[i]._id, {
          state: "Canceled",
          allOfTicket: null,
        });
      }
    }, // onTick
    null, // onComplete
    true, // start
    "Asia/Ho_Chi_Minh" // timeZone
  );

exports.testFunc = async () => {
  // const newDate = new Date();
  // // const diffMinute = (val) => (newDate - new Date(val)) / 1000;
  // // const minutes = (val) => Math.floor(diffMinute(val) / 60);
  // // const seconds = (val) => Math.round(diffMinute(val) - minutes(val) * 60);
  // const doc = await Order.find(
  //   {
  //     state: "Pending",
  //     createdAt: { $lte: new Date(newDate.getTime() - 1 * 60000) },
  //   },
  //   "state allOfTicket createdAt"
  // );
  // for (let i = 0; i < doc.length; i++) {
  //   for (let j = 0; j < doc[i].allOfTicket.length; j++) {
  //     const ticketArr = doc[i].allOfTicket;
  //     await Ticket.findByIdAndUpdate(ticketArr[j].id, {
  //       state: "Pending",
  //       issuedDate: null,
  //     });
  //   }
  //   await Order.findByIdAndUpdate(doc[i]._id, {
  //     state: "Canceled",
  //     allOfTicket: null,
  //   });
  // }
  // for (let i = 0; i < doc.length; i++) {
  //   const d = doc[i].createdAt;
  //   console.log(`${minutes(d)}:${seconds(d)}`);
  // }
};
