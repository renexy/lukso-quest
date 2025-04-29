export default async function handler(req: Request) {
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
  