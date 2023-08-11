import request from "supertest";
import app from "../app";

const dummyBody: Readonly<{ [key: string]: string }> = {
  email: "12345@gmail.com",
  name: "Nick",
};

describe("POST /user endpoint", () => {
  it("should return 400 when email is not provided", async () => {
    const response = await request(app)
      .post("/user")
      .send({ name: dummyBody.name });

    expect(response.statusCode).toBe(400);
    expect(response.badRequest).toBeTruthy();
    expect(response.body.msg).toBe("Email is missing from the request");
  });

  it("should return 400 when email is not @gmail.com", async () => {
    const response = await request(app)
      .post("/user")
      .send({ email: "123@outlook.com", name: dummyBody.name });
    expect(response.statusCode).toBe(400);
    expect(response.badRequest).toBeTruthy();
    expect(response.body.msg).toBe("Email does not match a gmail format");
  });

  it("should return 400 when name is not provided", async () => {
    const response = await request(app)
      .post("/user")
      .send({ email: dummyBody.email });

    expect(response.statusCode).toBe(400);
    expect(response.badRequest).toBeTruthy();
    expect(response.body.msg).toBe("Name is missing from the request");
  });

  it("should return 400 when name is too long", async () => {
    const response = await request(app).post("/user").send({
      email: dummyBody.email,
      name: "2ij1ifjiu4ghiu3hgiu4hgu4hguyh2uyhuy2gbyu3bf3bf4tasaass3f3wf4",
    });
    expect(response.statusCode).toBe(400);
    expect(response.badRequest).toBeTruthy();
    expect(response.body.msg).toBe(
      "Name should be less than 30 characters long"
    );
  });

  it("should return 201 and generate new token", async () => {
    const response = await request(app).post("/user").send(dummyBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).not.toBeNull();
  });
});
