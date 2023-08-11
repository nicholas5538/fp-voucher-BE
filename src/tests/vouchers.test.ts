import { config } from "dotenv";
import { disconnect, Types } from "mongoose";
import jwt from "jsonwebtoken";
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

beforeEach(
  async () =>
    await connectDb({
      uri: process.env.MONGO_URI!,
      collection: process.env.MONGO_COLLECTION!,
    })
);
afterEach(async () => await disconnect());

describe("Test JWT verification middleware", () => {
  it("should deny access with an expired token", async () => {
    const expiredToken = jwt.sign(dummyBody, process.env.JWT_SECRET as string, {
      algorithm: "HS512",
      expiresIn: 0,
    });

    const response = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(response.statusCode).toBe(
      httpErrorsMessage.TokenExpiredError.statusCode
    );
    expect(response.body.msg).toBe(httpErrorsMessage.TokenExpiredError.message);
    expect(response.unauthorized).toBeTruthy();
  });

  it("should deny access with an invalid token (NotBeforeError)", async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const notBefore = currentTime + 300;
    const notBeforeToken = jwt.sign(
      dummyBody,
      process.env.JWT_SECRET as string,
      {
        algorithm: "HS512",
        expiresIn: process.env.JWT_EXPIRES_IN,
        notBefore,
      }
    );

    const response = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", `Bearer ${notBeforeToken}`);
    expect(response.statusCode).toBe(
      httpErrorsMessage.NotBeforeError.statusCode
    );
    expect(response.body.msg).toBe(httpErrorsMessage.NotBeforeError.message);
    expect(response.unauthorized).toBeTruthy();
  });

  it("should deny access with an invalid token (JsonWebTokenError)", async () => {
    const response = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", "Bearer 12345");
    expect(response.statusCode).toBe(
      httpErrorsMessage.JsonWebTokenError.statusCode
    );
    expect(response.body.msg).toBe(httpErrorsMessage.JsonWebTokenError.message);
    expect(response.forbidden).toBeTruthy();
  });

  it("should deny access without a token", async () => {
    const response = await request(app).get("/api/v1/vouchers");
    expect(response.statusCode).toBe(httpErrorsMessage.NoToken.statusCode);
    expect(response.body.msg).toBe(httpErrorsMessage.NoToken.message);
    expect(response.unauthorized).toBeTruthy();
  });

  it("should allow access with a valid token", async () => {
    let response = await request(app).post("/user").send(dummyBody);
    expect(response.body).not.toBeNull();
    validToken = `Bearer ${response.body.token}`;

    response = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
  });
});

describe("GET /api/v1/vouchers", () => {
  it("should return next and previous URLs when there is offset and limit", async () => {
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
  it("should return an error when id is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/vouchers/dddddddddddddddddddddddd")
      .set("Authorization", validToken);
    expect(response.status).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(response.body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(response.notFound).toBeTruthy();
  }, 10000);

  it("should return the voucher when id is valid", async () => {
    const _id = new Types.ObjectId();
    const startDate = new Date();
    const dummyVoucher: Pick<
      Tvouchers,
      | "_id"
      | "category"
      | "description"
      | "discount"
      | "minSpending"
      | "promoCode"
      | "startDate"
      | "expiryDate"
    > = {
      _id,
      category: "Pick-up",
      description: "API test only",
      discount: 10,
      minSpending: 0,
      promoCode: "APITEST10",
      startDate,
      expiryDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
    await Vouchers.create(dummyVoucher);

    const response = await request(app)
      .get(`/api/v1/vouchers/${_id}`)
      .set("Authorization", validToken);
    await Vouchers.findByIdAndDelete(_id);
    expect(response.status).toBe(200);
    expect(response.body.results).not.toBeUndefined();
    expect(response.body["X-Total-count"]).toEqual(1);
  });
});
