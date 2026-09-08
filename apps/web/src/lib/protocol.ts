export const network = { chainId: 102031, rpc: "https://rpc.cc3-testnet.creditcoin.network", explorer: "https://creditcoin-testnet.blockscout.com" };
export const addresses = {
  operator: "0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea",
  token: "0xc2B0D2A7e858F13B349843fF87dBF4EBF9227F49",
  evidence: "0xF7602C048F8C7Cc5E8c514522D633eb9A16a3a1B",
  policy: "0x15B9E263B6E896d4D8F0D9c89878678aa6abAdeC",
  loans: "0x0115CA8539906db2d9a4beE36C64eA94a0d7Fa31",
};
export const evidenceId = "0xbc5526964f73ef1a119c06952ebf4211dc4fadc412f870281b6535e22044f2e7";
export const loanAbi = [
  "function activeLoan(address) view returns(uint256)", "function totalOutstanding() view returns(uint256)",
  "function lender() view returns(address)", "function defaultHistory(address) view returns(bool)",
  "function loans(uint256) view returns(address operator,uint256 principal,uint256 debt,uint256 dueAt,bool defaulted)",
  "function fund(uint256)", "function withdraw(uint256)", "function borrow(uint256) returns(uint256)", "function repay(uint256,uint256)",
  "event Funded(uint256 amount)", "event Withdrawn(uint256 amount)",
  "event Borrowed(uint256 indexed id,address indexed operator,uint256 principal,uint256 debt,uint256 dueAt)",
  "event Repaid(uint256 indexed id,uint256 amount,uint256 remaining)", "event Defaulted(uint256 indexed id,uint256 unpaidDebt)",
];
export const tokenAbi = ["function balanceOf(address) view returns(uint256)", "function allowance(address,address) view returns(uint256)", "function approve(address,uint256) returns(bool)"];
export type Snapshot = {
  block: number; account: string; limit: string; cash: string; balance: string; debt: string; activeId: string;
  lender: string; defaulted: boolean; accepted: boolean; dueAt: string;
  events: { name: string; values: string[]; hash: string; block: number; index: number }[];
  evidence: { id: string; amount: string; paidAt: string; hash: string }[];
  totalOutstanding: string;
  portfolio: { id: string; operator: string; principal: string; debt: string; dueAt: string; defaulted: boolean }[];
  historyFromBlock: number;
};
export function units(value: string) {
  const n = BigInt(value); const fraction = (n % 1000000n).toString().padStart(6, "0").replace(/0+$/, "");
  return `${(n / 1000000n).toLocaleString("en-US")}${fraction ? `.${fraction}` : ""}`;
}
export const source = { chainId: 11155111, contract: "0xd4B7fCecE89ABE7cAEd26aB34b548465ae05eE1B", asset: "0x284991966A8256521e72470E3B92E03E8aB8c1C3" };
export const evidenceAbi = [
  "function accept((uint64 chainKey,uint64 blockHeight,bytes encodedTransaction,(bytes32 root,(bytes32 hash,bool isLeft)[] siblings) merkleProof,(bytes32 lowerEndpointDigest,bytes32[] roots) continuityProof,uint256 logIndex) proof) returns(bytes32)",
  "event EvidenceAccepted(bytes32 indexed evidenceId,address indexed operator,uint256 indexed paymentId,uint256 amount,uint64 paidAt,uint64 sourceBlock,uint256 logIndex,bytes32 policyVersion)",
];
