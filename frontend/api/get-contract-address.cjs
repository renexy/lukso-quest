// Import any necessary libraries using `require`
const { Response } = require('@vercel/node'); // If needed, import this depending on the environment

// Define the handler function
async function handler(req) {
  const contractAddress = process.env.LUKSO_CONTRACT_ADDRESS;

  if (!contractAddress) {
    return new Response(
      JSON.stringify({ error: "Contract address not set" }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ address: contractAddress }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Export the handler function using `module.exports`
module.exports = handler;
