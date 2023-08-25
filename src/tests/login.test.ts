import { config } from "dotenv";
import request from "supertest";
import app from "../app.js";
import { dummyBody } from "./common.js";

config();

describe("POST /user endpoint", () => {
  it("should return 400 when email is not provided", async () => {
    const { badRequest, body, statusCode } = await request(app)
      .post("/user")
      .send({ name: dummyBody.name });

    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(body.msg).toBe("Email is missing from the request");
  });

  it("should return 400 when email is not @gmail.com", async () => {
    const { badRequest, body, statusCode } = await request(app)
      .post("/user")
      .send({ email: "123@outlook.com", name: dummyBody.name });
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(body.msg).toBe("Email does not match a gmail format");
  });

  it("should return 400 when name is not provided", async () => {
    const { badRequest, body, statusCode } = await request(app)
      .post("/user")
      .send({ email: dummyBody.email });

    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(body.msg).toBe("Name is missing from the request");
  });

  it("should return 400 when name is too long", async () => {
    const { badRequest, statusCode, body } = await request(app)
      .post("/user")
      .send({
        email: dummyBody.email,
        name: "2ij1ifjiu4ghiu3hgiu4hgu4hguyh2uyhuy2gbyu3bf3bf4tasaass3f3wf4",
      });
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(body.msg).toBe("Name should be less than 30 characters long");
  });

  it("should return 201 and generate new token", async () => {
    const { body, statusCode } = await request(app)
      .post("/user")
      .send(dummyBody);
    expect(statusCode).toBe(201);
    expect(body).not.toBeNull();
  });
});
