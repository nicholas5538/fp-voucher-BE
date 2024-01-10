import { oAuth2Client } from "../app.js";
import asyncWrapper from "../middleware/async.js";
import { UserRefreshClient } from "google-auth-library";
import createError from "http-errors";

export const googleAuth = asyncWrapper(async (req, res, next) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code);
  if (!tokens.access_token) {
    return next(createError(406, "There is an issue with the request body"));
  }

  return res.status(200).json({
    msg: "Tokens has been issued",
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    id_token: tokens.id_token,
    expiry_date: tokens.expiry_date,
  });
});

export const refreshGoogleToken = asyncWrapper(async (req, res, next) => {
  const user = new UserRefreshClient(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    req.body.refreshToken
  );
  const { credentials } = await user.refreshAccessToken();
  if (!credentials.access_token) {
    return next(createError(406, "There is an issue with the request body"));
  }

  return res.status(200).json({
    msg: "Tokens has been refreshed",
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
    id_token: credentials.id_token,
    expiry_date: credentials.expiry_date,
  });
});
