import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../config/env.js";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export { verify };
