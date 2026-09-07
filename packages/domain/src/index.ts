export type Hex = `0x${string}`;
export type VerificationMode = 'mock' | 'live';
export interface RevenueEvidence {
  operator: Hex;
  sourceChainId: number;
  transactionHash: Hex;
  eventIndex: number;
  asset: Hex;
  amountBaseUnits: string;
  periodStart: number;
  periodEnd: number;
}
export interface VerificationResult {
  mode: VerificationMode;
  status: 'pending' | 'verified' | 'rejected';
  evidenceId: Hex;
  verificationTransactionHash?: Hex;
  reason?: string;
}
