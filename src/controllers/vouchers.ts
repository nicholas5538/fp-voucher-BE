import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import createError from "http-errors";
import { Types } from "mongoose";
import { updateSchema } from "../constants/joi-schema";
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

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Singapore");

export const getVoucher = asyncWrapper(async (req, res, next) => {
  const { id: _id } = req.params;
  const voucher = await Vouchers.findById({ _id }).exec();
  if (!voucher) {
    return next(
      createError(
        httpErrorsMessage.NoVoucher.statusCode,
        httpErrorsMessage.NoVoucher.message
      )
    );
  }

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
  voucher.expiryDate = dayjs(voucher.expiryDate).add(1, "day").toDate();
  voucher.startDate = dayjs(voucher.startDate).add(1, "day").toDate();

  const validationError = voucher.validateSync();
  if (validationError) {
    return next(createError(400, validationError.message));
  }
  await voucher.save();
  return res.status(201).json({ msg: "Voucher has been created" });
});

export const updateVoucher = asyncWrapper(async (req, res, next) => {
  const { id: _id } = req.params;
  const body = req.body;
  if (body.constructor === Object && Object.keys(body).length === 0) {
    return next(
      createError(
        httpErrorsMessage.NoBody.statusCode,
        httpErrorsMessage.NoBody.message
      )
    );
  }

  // When updating date, both startDate and expiryDate
  // needs to be in the body for schema validation purposes
  if (
    Object.prototype.hasOwnProperty.call(body, "startDate") ||
    Object.prototype.hasOwnProperty.call(body, "expiryDate")
  ) {
    body.startDate = dayjs(body.startDate).add(1, "day").toDate();
    body.expiryDate = dayjs(body.expiryDate).add(1, "day").toDate();
  }

  const validationResult = updateSchema.validate(body);
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const voucher = await Vouchers.findByIdAndUpdate(_id, body, {
    returnDocument: "before",
    upsert: false,
  });

  return !voucher
    ? next(
        createError(
          httpErrorsMessage.NoVoucher.statusCode,
          httpErrorsMessage.NoVoucher.message
        )
      )
    : res.status(204).json({ msg: "No content" });
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
