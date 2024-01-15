import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app.js";
import { dummyBody } from "./common.js";
import httpErrorsMessage from "../constants/error-messages.js";

describe("Test JWT verification middleware", () => {
  it("should deny access with an expired token", async () => {
    const expiredToken = jwt.sign(dummyBody, process.env.JWT_SECRET as string, {
      algorithm: "HS512",
      expiresIn: 0,
    });

    const { body, statusCode, unauthorized } = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(statusCode).toBe(httpErrorsMessage.TokenExpiredError.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.TokenExpiredError.message);
    expect(unauthorized).toBeTruthy();
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

    const { body, statusCode, unauthorized } = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", `Bearer ${notBeforeToken}`);
    expect(statusCode).toBe(httpErrorsMessage.NotBeforeError.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NotBeforeError.message);
    expect(unauthorized).toBeTruthy();
  });

  it("should deny access with an invalid token (JsonWebTokenError)", async () => {
    const { body, forbidden, statusCode } = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", "Bearer 12345");
    expect(statusCode).toBe(httpErrorsMessage.JsonWebTokenError.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.JsonWebTokenError.message);
    expect(forbidden).toBeTruthy();
  });

  it("should deny access without a token", async () => {
    const { body, statusCode, unauthorized } =
      await request(app).get("/api/v1/vouchers");
    expect(statusCode).toBe(httpErrorsMessage.NoToken.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoToken.message);
    expect(unauthorized).toBeTruthy();
  });

  it("should allow access with a valid token", async () => {
    const { headers } = await request(app).post("/user").send(dummyBody);
    expect(headers["set-cookie"].length).toBe(1);

    const validToken = `Bearer ${headers["set-cookie"][0]
      .split(";")[0]
      .slice(4)}`;
    const { body, statusCode } = await request(app)
      .get("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(statusCode).toBe(200);
    expect(body).not.toBeNull();
  }, 10000);
});
