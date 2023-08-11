import { config } from "dotenv";
import { disconnect } from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";
import httpErrorsMessage from "../constants/error-messages";
import connectDb from "../db/connect";

config();

beforeAll(
  async () =>
    await connectDb({
      uri: process.env.MONGO_URI!,
      collection: process.env.MONGO_COLLECTION!,
    })
);
afterAll(async () => await disconnect());

const dummyBody: Readonly<{ [key: string]: string }> = {
  email: "12345@gmail.com",
  name: "Nick",
};

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
    const validToken = `Bearer ${response.body.token}`;

    response = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
  });
});
