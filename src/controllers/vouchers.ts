import { Prisma } from "@prisma/client";
import createError from "http-errors";
import { voucherSchema } from "../constants/joi-schema.js";
import httpErrorsMessage from "../constants/error-messages.js";
import asyncWrapper, { prisma } from "../middleware/async.js";

type Tlinks = {
  base: string;
  last?: string;
  next?: string;
  previous?: string;
  self: string;
};

export const getVoucher = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  try {
    const voucher = await prisma.voucher.findUniqueOrThrow({ where: { id } });
    return res.status(200).json({
      _links: {
        base: baseUrl,
        self: baseUrl + req.originalUrl,
      },
      results: voucher,
      "X-Total-count": 1,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return next(
        createError(
          httpErrorsMessage.NoVoucher.statusCode,
          httpErrorsMessage.NoVoucher.message
        )
      );
    }
    return next();
  }
});

export const getVouchers = asyncWrapper(async (req, res, next) => {
  const { offset, limit } = req.query;
  const skip = Number(offset) || 0,
    take = Number(limit) || 10,
    page = Math.floor(skip / take) + 1;
  const vouchers = await prisma.voucher.findMany({
    skip,
    take,
  });

  const totalVouchersQuery = vouchers.length,
    baseUrl = `${req.protocol}://${req.get("host")}`,
    totalVouchersCount = await prisma.voucher.count(),
    lastPage = Math.floor(totalVouchersCount / take) + 1,
    links: Tlinks = {
      base: baseUrl,
      self: baseUrl + req.originalUrl,
    };

  if (totalVouchersQuery === 0) {
    return next(
      createError(
        httpErrorsMessage.NoVoucher.statusCode,
        httpErrorsMessage.NoVoucher.message
      )
    );
  }

  if (skip + totalVouchersQuery < totalVouchersCount) {
    links.next = `${baseUrl}${req.originalUrl.slice(0, 16)}?offset=${
      skip + take
    }&limit=${take}`;
  }

  if (skip > 0) {
    links.previous = `${baseUrl}${req.originalUrl.slice(
      0,
      16
    )}?offset=${Math.max(0, skip - take)}&limit=${take}`;
  }

  return res.status(200).json({
    _links: links,
    end: skip + totalVouchersQuery,
    lastPage,
    limit: take,
    page,
    results: vouchers,
    start: skip,
    totalVouchers: totalVouchersCount,
    "X-Total-count": totalVouchersQuery,
  });
});

export const createVoucher = asyncWrapper(async (req, res, next) => {
  const reqBody = req.body;
  const { value: data, error } = voucherSchema.validate(reqBody, {
    dateFormat: "date",
  });

  if (error) {
    return next(createError(400, error.message));
  }

  await prisma.voucher.create({ data });
  return res.status(201).json({ msg: "Voucher has been created" });
});

export const updateVoucher = asyncWrapper(async (req, res, next) => {
  const body = req.body;
  if (body.constructor === Object && Object.keys(body).length === 0) {
    return next(
      createError(
        httpErrorsMessage.NoBody.statusCode,
        httpErrorsMessage.NoBody.message
      )
    );
  }

  const validationResult = voucherSchema.validate(body, { convert: true });
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  try {
    await prisma.voucher.update({
      where: { id: req.params.id },
      data: body,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return next(
        createError(
          httpErrorsMessage.NoVoucher.statusCode,
          httpErrorsMessage.NoVoucher.message
        )
      );
    }
    return next();
  }

  return res.status(204).json({ msg: "No content" });
});

export const deleteVoucher = asyncWrapper(async (req, res, next) => {
  try {
    await prisma.voucher.delete({
      where: { id: req.params.id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return next(
        createError(
          httpErrorsMessage.NoVoucher.statusCode,
          httpErrorsMessage.NoVoucher.message
        )
      );
    }
    return next();
  }

  return res.status(204).json({ msg: "No content" });
});
