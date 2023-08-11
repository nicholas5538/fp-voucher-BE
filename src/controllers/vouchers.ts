import createError from "http-errors";
import httpErrorsMessage from "../constants/error-messages";
import asyncWrapper from "../middleware/async";
import Vouchers from "../models/vouchers";

type Tlinks = {
  base: string;
  last?: string;
  next?: string;
  previous?: string;
  self: string;
};

export const getVoucher = asyncWrapper(async (req, res, next) => {
  const { id: _id } = req.params;
  const voucher = await Vouchers.findById({ _id }).exec();
  if (!voucher)
    return next(
      createError(
        httpErrorsMessage.NoVoucher.statusCode,
        httpErrorsMessage.NoVoucher.message
      )
    );

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return res.status(200).json({
    _links: {
      base: baseUrl,
      self: baseUrl + req.originalUrl,
    },
    results: voucher,
    "X-Total-count": 1,
  });
});

export const getVouchers = asyncWrapper(async (req, res, next) => {
  const { offset, limit } = req.query;
  const skip = Number(offset) || 0,
    limitNo = Number(limit) || 10;

  const vouchers = await Vouchers.find().skip(skip).limit(limitNo);
  const totalVoucherQuery = vouchers.length;
  if (!totalVoucherQuery)
    return next(
      createError(
        httpErrorsMessage.NoVoucher.statusCode,
        httpErrorsMessage.NoVoucher.message
      )
    );

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const totalData = await Vouchers.countDocuments().exec();

  const links: Tlinks = {
    base: baseUrl,
    self: baseUrl + req.originalUrl,
  };

  if (skip + totalVoucherQuery < totalData) {
    links.next = `${baseUrl}${req.originalUrl.slice(0, 16)}?offset=${
      skip + limitNo
    }&limit=${limitNo}`;
  }

  if (skip > 0) {
    const newOffset = Math.max(0, skip - limitNo);
    links.previous = `${baseUrl}${req.originalUrl.slice(
      0,
      16
    )}?offset=${newOffset}&limit=${limitNo}`;
  }

  return res.status(200).json({
    _links: links,
    end: skip + totalVoucherQuery,
    limit: limitNo,
    results: vouchers,
    start: skip,
    "X-Total-count": totalVoucherQuery,
  });
});

// TODO: POST, PATCH, DELETE request
