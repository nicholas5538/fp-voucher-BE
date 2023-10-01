import "dotenv/config";
import { disconnect, Types, type Document } from "mongoose";
import request from "supertest";
import app from "../app.js";
import httpErrorsMessage from "../constants/error-messages.js";
import type { Tvouchers } from "../constants/type-interface.js";
import connectDb from "../db/connect.js";
import Vouchers from "../models/vouchers.js";

let validToken = "";
const dummyBody: Readonly<{ [key: string]: string }> = {
  email: "12345@gmail.com",
  name: "Nick",
};
const dummyVoucher: Omit<Tvouchers, keyof Document> & Pick<Tvouchers, "_id"> = {
  _id: "",
  category: "Pick-up",
  description: "API test only",
  discount: 10,
  minSpending: new Types.Decimal128("0"),
  promoCode: "APITEST10",
  startDate: new Date(),
  expiryDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
};

beforeAll(
  async () =>
    await connectDb({
      uri: process.env.MONGO_URI!,
      collection: process.env.MONGO_COLLECTION!,
    })
);
afterAll(async () => await disconnect());

describe("GET /api/v1/vouchers", () => {
  it("should return no voucher error when the offset or limit is out of bounds", async () => {
    const { body: getToken } = await request(app).post("/user").send(dummyBody);
    validToken = `Bearer ${getToken.token}`;

    const { body, notFound, statusCode } = await request(app)
      .get(`/api/v1/vouchers?offset=${Number.MAX_SAFE_INTEGER}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return next and previous URLs when there is offset and limit", async () => {
    const { body, statusCode } = await request(app)
      .get("/api/v1/vouchers?offset=1&limit=1")
      .set("Authorization", validToken);
    expect(statusCode).toBe(200);
    expect(body).not.toBeNull();
    expect(body["_links"]).toHaveProperty("next");
    expect(body["_links"]).toHaveProperty("previous");
  });
});

describe("GET /api/v1/vouchers/:id", () => {
  it("should return an error when the id is invalid", async () => {
    const { body, notFound, statusCode } = await request(app)
      .get("/api/v1/vouchers/dddddddddddddddddddddddd")
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return the voucher when the id is valid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });

    const { body, statusCode } = await request(app)
      .get(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    await Vouchers.findByIdAndDelete(_id);
    expect(statusCode).toBe(200);
    expect(body.results).not.toBeUndefined();
    expect(body["X-Total-count"]).toEqual(1);
  });
});

describe("POST /api/v1/vouchers", () => {
  it("should return validation error when the request body is invalid", async () => {
    const { badRequest, statusCode } = await request(app)
      .post("/api/v1/vouchers")
      .send(dummyBody)
      .set("Authorization", validToken);
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
  });

  it("should create a voucher when the request body is valid", async () => {
    const newVoucher: typeof dummyVoucher = {
      ...dummyVoucher,
      _id: new Types.ObjectId(),
      description: "aaaaa",
      promoCode: "AAAAA",
    };
    const { body, statusCode } = await request(app)
      .post("/api/v1/vouchers")
      .send(newVoucher)
      .set("Authorization", validToken);

    await Vouchers.deleteOne({
      description: newVoucher.description,
      promoCode: newVoucher.promoCode,
    });
    expect(statusCode).toBe(201);
    expect(body.msg).toBe("Voucher has been created");
  });
});

describe("PATCH /api/v1/vouchers", () => {
  it("should return not found when the id is missing", async () => {
    const { notFound, statusCode } = await request(app)
      .patch("/api/v1/vouchers")
      .send({})
      .set("Authorization", validToken);
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
  });

  it("should return no voucher error when the id is invalid", async () => {
    const fakeId = new Types.ObjectId();
    const { body, notFound, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${fakeId}`)
      .send({ discount: 20 })
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return validation error when the request body is empty", async () => {
    const fakeId = new Types.ObjectId();
    const { badRequest, body, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${fakeId}`)
      .send({})
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoBody.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoBody.message);
    expect(badRequest).toBeTruthy();
  });

  it("should return validation error when the request body is invalid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });
    const { badRequest, body, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${_id}`)
      .send({ category: "not a category" })
      .set("Authorization", validToken);

    await request(app)
      .delete(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(400);
    expect(body.msg).not.toBeNull();
    expect(badRequest).toBeTruthy();
  });

  it("should update the document when both id and body are valid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });
    const { noContent, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${_id}`)
      .send({ startDate: "2023-01-01", expiryDate: "2024-04-04" })
      .set("Authorization", validToken);

    await request(app)
      .delete(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(204);
    expect(noContent).toBeTruthy();
  });
});

describe("DELETE /api/v1/vouchers/:id", () => {
  it("should return not found error when the id is not provided", async () => {
    const { body, notFound, statusCode } = await request(app)
      .delete("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("Not Found");
    expect(notFound).toBeTruthy();
  });

  it("should return server error when the id is not a ObjectId", async () => {
    const { body, serverError, statusCode } = await request(app)
      .delete("/api/v1/vouchers/abcdef")
      .set("Authorization", validToken);
    expect(statusCode).toBe(500);
    expect(body.msg).toBe("Something went wrong, please try again");
    expect(serverError).toBeTruthy();
  });

  it("should return no voucher when the id is invalid", async () => {
    // :id must have a length of 25
    const fakeId = new Types.ObjectId();
    const { body, notFound, statusCode } = await request(app)
      .delete(`/api/v1/vouchers/${fakeId}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should delete voucher when the id is valid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });
    const { noContent, statusCode } = await request(app)
      .delete(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(204);
    expect(noContent).toBeTruthy();
  });
});
