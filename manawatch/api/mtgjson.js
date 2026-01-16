import axios from 'axios';

export default async function handler(req, res) {
  // 1. Authorization: Prioritize the environment variable, fallback only for testing
  const token = process.env.MTGJSON_TOKEN || '1571cbc36270f7197a46d7203dcd0f78bb3a76d4';

  // 2. Defensive Body Parsing: Ensures req.body is an object regardless of Vercel's state
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query, variables } = body || {};

  // 3. Early Exit: Stop if the frontend didn't send a query
  if (!query) {
    return res.status(400).json({ error: "GraphQL query is required." });
  }

  try {
    const response = await axios({
      url: 'https://graphql.mtgjson.com/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Apollo-Require-Preflight': 'true',
        'x-apollo-operation-name': 'GetPrices'
      },
      data: { query, variables }
    });

    // 4. Success: Send the data back to your Angular app
    return res.status(200).json(response.data);

  } catch (error) {
    // 5. Error Handling: Log internally for you, send clean error to frontend
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: "Internal Server Error" };
    
    console.error(`MTGJSON API Error [${status}]:`, JSON.stringify(errorData, null, 2));
    return res.status(status).json(errorData);
  }
}