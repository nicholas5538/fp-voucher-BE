import dayjs from "dayjs";
import createError from "http-errors";
import { Types } from "mongoose";
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
  // page = skip, pageSize: limit
  const skip = Number(offset) || 0,
    limitNo = Number(limit) || 10,
    page = Math.floor(skip / limitNo) + 1;

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
  const totalVouchers = await Vouchers.countDocuments().exec();
  const lastPage = Math.floor(totalVouchers / limitNo) + 1;

  const links: Tlinks = {
    base: baseUrl,
    self: baseUrl + req.originalUrl,
  };

  if (skip + totalVoucherQuery < totalVouchers) {
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
    lastPage,
    limit: limitNo,
    page,
    results: vouchers,
    start: skip,
    "X-Total-count": totalVoucherQuery,
  });
});

export const createVoucher = asyncWrapper(async (req, res, next) => {
  const voucher = new Vouchers(req.body);

  // Modify req.body
  voucher._id = new Types.ObjectId();
  voucher.expiryDate = dayjs(voucher.expiryDate).toDate();
  voucher.startDate = dayjs(voucher.startDate).toDate();

  const validationError = voucher.validateSync();
  if (validationError) {
    return next(createError(400, validationError.message));
  }
  await voucher.save();
  return res.status(201).json({ msg: "Voucher has been created" });
});

export const deleteVoucher = asyncWrapper(async (req, res, next) => {
  const { id: _id } = req.params;
  const voucher = await Vouchers.findOneAndDelete({ _id }).exec();

  return !voucher
    ? next(
        createError(
          httpErrorsMessage.NoVoucher.statusCode,
          httpErrorsMessage.NoVoucher.message
        )
      )
    : res.status(204).json({ msg: "No content" });
});
