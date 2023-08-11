import { config } from "dotenv";
import { disconnect, Types, type Document } from "mongoose";
import request from "supertest";
import app from "../app";
import httpErrorsMessage from "../constants/error-messages";
import type { Tvouchers } from "../constants/type-interface";
import connectDb from "../db/connect";
import Vouchers from "../models/vouchers";

config();

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
  minSpending: 0,
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
  it("should return next and previous URLs when there is offset and limit", async () => {
    const { body } = await request(app).post("/user").send(dummyBody);
    validToken = `Bearer ${body.token}`;

    const response = await request(app)
      .get("/api/v1/vouchers?offset=1&limit=1")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
    expect(response.body["_links"]).toHaveProperty("next");
    expect(response.body["_links"]).toHaveProperty("previous");
  });
});

describe("GET /api/v1/vouchers/:id", () => {
  it("should return an error when the id is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/vouchers/dddddddddddddddddddddddd")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(response.body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(response.notFound).toBeTruthy();
  });

  it("should return the voucher when the id is valid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });

    const response = await request(app)
      .get(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    await Vouchers.findByIdAndDelete(_id);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).not.toBeUndefined();
    expect(response.body["X-Total-count"]).toEqual(1);
  });
});

describe("DELETE /api/v1/vouchers/:id", () => {
  it("should return not found erorr when the id is not provided", async () => {
    const response = await request(app)
      .delete("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(404);
    expect(response.body.msg).toBe("Not Found");
    expect(response.notFound).toBeTruthy();
  });

  it("should return server error when the id is not a ObjectId", async () => {
    const response = await request(app)
      .delete("/api/v1/vouchers/abcdef")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(500);
    expect(response.body.msg).toBe("Something went wrong, please try again");
    expect(response.serverError).toBeTruthy();
  });

  it("should return no voucher when the id is invalid", async () => {
    // :id must have a length of 25
    const fakeId = new Types.ObjectId();
    const response = await request(app)
      .delete(`/api/v1/vouchers/${fakeId}`)
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(response.body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(response.notFound).toBeTruthy();
  });

  it("should delete voucher when the id is valid", async () => {
    const _id = new Types.ObjectId();
    await Vouchers.create({ ...dummyVoucher, _id });

    const response = await request(app)
      .delete(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(204);
    expect(response.noContent).toBeTruthy();
  });
});
