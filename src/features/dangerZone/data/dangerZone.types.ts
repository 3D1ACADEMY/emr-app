export type RiskTier = "critical" | "high" | "moderate";

export type DangerZone = {
  id: string;
  name: string;
  region: string;
  parentVessel: string;
  anastomoses: string[];
  riskTier: RiskTier;
  whyItMatters: string;
  warningSigns: string[];
  immediateActions: string[];
  protocolLink: string;
  aliases: string[];
  citation: string;
  reviewedBy: string;
  reviewedOn: string;
};
