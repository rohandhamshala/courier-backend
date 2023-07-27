const db = require("../models");
const Order = db.order;
const Customer = db.customer;
const User = db.user;
const Payment = db.payment;
const sequelize = db.sequelize;
const { QueryTypes, Op } = require('sequelize');

exports.getReport = async(req, res) => {
    try{
        const employeeCount = await getUsersCount({});
        const adminCount = await getUsersCount({ roleId: 1});
        const clerkCount = await getUsersCount({ roleId: 2});
        const deliveryBoyCount = await getUsersCount({ roleId: 3});
        const customerCount = await getCustomersCount({});
        const pendingOrdersCount = await getOrdersCount({ status: "PENDING"});
        const progressOrdersCount = await getOrdersCount({ status: "PROGRESS"});
        const deliveredOrdersCount = await getOrdersCount({ status: "DELIVERED"});
        const orderCount = pendingOrdersCount+progressOrdersCount+deliveredOrdersCount;
        const deliveryInTimeCount = await getOrdersCount({ delivered_in_time: "YES"});
        const notDeliveryInTimeCount = deliveredOrdersCount - deliveryInTimeCount;
        const totalCreditedAmount = await getPaymentCreditedAmount({});
        const totalOrderAmount = await getOrdersAmount({});
        const deliveryBoyAmountForOrders = await getDeliveryBoyAmount();
        const lastWeekReport = await this.getLastWeekReport();
        res.send({
            employeeCount,
            adminCount,
            clerkCount,
            deliveryBoyCount,
            customerCount,
            orderCount,
            pendingOrdersCount,
            progressOrdersCount,
            deliveredOrdersCount,
            deliveryBoyAmountForOrders,
            deliveryInTimeCount,
            notDeliveryInTimeCount,
            totalCreditedAmount,
            totalOrderAmount,
            weeklyReport: lastWeekReport
        })
    }
    catch(e) {
        res.status(500).send({
            message:
            e.message || "Some error occurred while generating report.",
        });
    }
}

exports.lastWeekReport = async (req, res) => {
    try{
        lastWeekReport = await this.getLastWeekReport()
        res.send(lastWeekReport)
    }
    catch(e){
        res.status(500).send({
            message:
            e.message || "Some error occurred while generating report.",
        });
    }
}

async function getOrdersCount(condition) {
   return await Order.count({ where: condition })
}
async function getOrdersAmount(condition) {
    return await Order.sum('price_for_order',{ where: condition })
 }
async function getDeliveryBoyAmount() {
    const query = `
    SELECT SUM(price_for_delivery_boy + delivery_boy_bonus) AS total_sum
    FROM orders;
    `;
    const result = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    });
    const totalSum = result[0].total_sum;
    return totalSum;
}
async function getUsersCount(condition) {
    return await User.count({ where: condition })
 }

 async function getCustomersCount(condition) {
    return await Customer.count({ where: condition })
 }

 async function getPaymentCreditedAmount(condition) {
    return await Payment.sum('credited_amount', { where: condition });
 }

exports.getLastWeekReport = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
 
    const condition = {
    createdAt: {
        [Op.between]: [oneWeekAgo, new Date()],
    },
    };

    const pendingReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'PENDING',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true,
    });

    const progressReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'PROGRESS',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true,
    });

    const deliveredReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'DELIVERED',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('delivered_at')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('delivered_at'))],
    raw: true,
    });

    const mergedReport = mergeReports(pendingReport, progressReport, deliveredReport);
    return mergedReport
 };
 
 function mergeReports(pending, progress, delivered) {
   const merged = [];
 
   pending.forEach((item) => {
     const date = item.date;
     const pendingCount = item.count;
     const progressCount = findCountByDate(progress, date);
     const deliveredCount = findCountByDate(delivered, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
   });
 
   progress.forEach((item) => {
     const date = item.date;
     const progressCount = item.count;
     const pendingCount = findCountByDate(pending, date);
     const deliveredCount = findCountByDate(delivered, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     // Check if the date is already processed in the pending loop
     const existingItem = merged.find((item) => item.date === date);
     if (!existingItem) {
       merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
     }
   });
 
   delivered.forEach((item) => {
     const date = item.date;
     const deliveredCount = item.count;
     const pendingCount = findCountByDate(pending, date);
     const progressCount = findCountByDate(progress, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     // Check if the date is already processed in the pending or progress loop
     const existingItem = merged.find((item) => item.date === date);
     if (!existingItem) {
       merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
     }
   });
 
   return merged;
 }
 
 function findCountByDate(report, date) {
   const item = report.find((item) => item.date === date);
   return item ? item.count : 0;
 }
 