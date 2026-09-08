import { Contract, FetchRequest, JsonRpcProvider, isAddress } from "ethers";
import { addresses, evidenceAbi, network } from "@/lib/protocol";
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text(); if (body.length > 1000) throw new Error();
    input = JSON.parse(body);
  } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const { account, transactionHash, logIndex } = input;
  if (!isAddress(account ?? "") || !/^0x[0-9a-fA-F]{64}$/.test(transactionHash ?? "") || !Number.isSafeInteger(logIndex) || logIndex < 0) return Response.json({ error: "Enter a wallet, transaction hash and receipt log position." }, { status: 400 });
  const transport = new FetchRequest(process.env.CREDITCOIN_RPC_URL ?? network.rpc); transport.timeout = 15000;
  const rpc = new JsonRpcProvider(transport);
  try {
    if ((await rpc.getNetwork()).chainId !== BigInt(network.chainId)) throw new Error();
    const r = await fetch(`https://prover.cc3-testnet.creditcoin.network/api/v1/proof-by-tx/1/${transactionHash}`, { signal: AbortSignal.timeout(20000), cache: "no-store" });
    const data = await r.json();
    if (!r.ok) return Response.json({ error: data.retriable === true ? "Payment is awaiting confirmations or attestation. Retry this transaction later." : "Proof service could not prepare this transaction." }, { status: 422 });
    if (data.chainKey !== 1 || data.txHash?.toLowerCase() !== transactionHash.toLowerCase() || !Number.isSafeInteger(data.headerNumber) || data.headerNumber < 0) throw new Error();
    const proof = { chainKey: 1, blockHeight: data.headerNumber, encodedTransaction: data.txBytes, merkleProof: data.merkleProof, continuityProof: data.continuityProof, logIndex };
    const registry = new Contract(addresses.evidence, evidenceAbi, rpc);
    const id = await registry.accept.staticCall(proof, { from: account });
    return Response.json({ evidenceId: id, to: addresses.evidence, data: registry.interface.encodeFunctionData("accept", [proof]), chainId: network.chainId });
  } catch {
    return Response.json({ error: "Evidence could not be accepted. Check payment recipient, recognized source, receipt position, freshness and whether it was already submitted." }, { status: 422 });
  } finally { rpc.destroy(); }
}
