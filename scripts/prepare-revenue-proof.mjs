import { readFile } from 'node:fs/promises';
import { Contract, JsonRpcProvider, isAddress } from 'ethers';

// Read-only: no signer, private key, or transaction broadcast.
const [txHash, logIndexText] = process.argv.slice(2);
const registryAddress = process.env.NODRA_EVIDENCE_ADDRESS;
const operator = process.env.NODRA_OPERATOR_ADDRESS;
if (!/^0x[0-9a-fA-F]{64}$/.test(txHash ?? '') || !/^(0|[1-9][0-9]*)$/.test(logIndexText ?? '')
    || !isAddress(registryAddress ?? '') || !isAddress(operator ?? '')) {
  throw new Error('Usage: NODRA_EVIDENCE_ADDRESS=0x… NODRA_OPERATOR_ADDRESS=0x… npm run proof:prepare -- <source-tx-hash> <receipt-log-index>');
}
const rpc = new JsonRpcProvider(process.env.CREDITCOIN_RPC_URL ?? 'https://rpc.cc3-testnet.creditcoin.network');
try {
  if ((await rpc.getNetwork()).chainId !== 102031n) throw new Error('Expected Creditcoin testnet (102031)');
  if (await rpc.getCode(registryAddress) === '0x') throw new Error('Evidence registry is not deployed');
  const artifact = JSON.parse(await readFile(new URL('../contracts/out/RevenueEvidence.sol/RevenueEvidence.json', import.meta.url), 'utf8'));
  const registry = new Contract(registryAddress, artifact.abi, rpc);
  const chainKey = await registry.sourceChainKey();
  if (chainKey !== 1n) throw new Error('This demo supports Sepolia chain key 1 only');
  // Read the service response directly: the SDK discards structured error details.
  const endpoint = process.env.ATTESTCOIN_PROOF_API_URL ?? 'https://prover.cc3-testnet.creditcoin.network';
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/v1/proof-by-tx/1/${txHash}`, {
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok) {
    const code = typeof data.code === 'string' ? data.code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0,80) : 'Unknown';
    const messages = {
      BlockNotOnSourceChain: 'Source block is not yet confirmed or available to the service.',
      BlockNotAttested: 'Source block is not yet attested.',
      BlockNotReady: 'The continuity proof is waiting for source-block attestation.',
    };
    const progress = Number.isSafeInteger(data.block_number) && Number.isSafeInteger(data.last_attested_block)
      ? ` Payment block: ${data.block_number}; last attested block: ${data.last_attested_block}.` : '';
    throw new Error(`Proof service HTTP ${response.status} (${code}). ${messages[code] ?? 'Proof generation failed.'}${progress} ${data.retriable === true ? 'Service reports this is retriable; wait and retry the same payment.' : 'Check service status before retrying.'}`);
  }
  if (data.chainKey !== 1 || data.txHash?.toLowerCase() !== txHash.toLowerCase()
      || !Number.isSafeInteger(data.headerNumber) || data.headerNumber < 0) throw new Error('Mismatched or unsafe proof metadata');
  const proof = { chainKey: 1n, blockHeight: BigInt(data.headerNumber), encodedTransaction: data.txBytes,
    merkleProof: data.merkleProof, continuityProof: data.continuityProof, logIndex: BigInt(logIndexText) };
  // Contract simulation checks native inclusion AND Nodra event semantics, ownership and replay.
  const evidenceId = await registry.accept.staticCall(proof, { from: operator });
  const transaction = await registry.accept.populateTransaction(proof);
  console.log(JSON.stringify({ status: 'simulation-passed-not-submitted', evidenceId,
    requestedSourceTransaction: txHash, chainId: '102031', from: operator, ...transaction },
    (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
} catch (error) {
  console.error(error.shortMessage ?? error.message ?? "Proof preparation failed");
  process.exitCode = 1;
} finally {
  rpc.destroy();
}
