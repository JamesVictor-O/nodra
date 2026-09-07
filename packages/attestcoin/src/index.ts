import type { RevenueEvidence, VerificationResult } from '@nodra/domain';

/** Integration boundary only. Implementations must bind proof contents to every evidence field. */
export interface RevenueVerifier {
  verify(evidence: RevenueEvidence, proof: Uint8Array): Promise<VerificationResult>;
}
