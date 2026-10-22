import { handleAuthRequest } from './frontend/src/server/authPlugin.js';

export default async function handler(req, res) {
  return handleAuthRequest(req, res);
}
