from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class ChurnPredictionRequest(BaseModel):
    monthlySpendDZD: float = Field(..., description="Monthly subscriber spend in Algerian Dinars (DZD)", json_schema_extra={"example": 1800})
    dataUsageGB: float = Field(..., description="Monthly data consumption in GB", json_schema_extra={"example": 4.2})
    callsCount: int = Field(..., description="Monthly outbound call volume", json_schema_extra={"example": 34})
    complaints: int = Field(..., description="Customer care complaints in past 60 days", json_schema_extra={"example": 3})
    rechargeFrequency: int = Field(..., description="Recharge replenishment events per month", json_schema_extra={"example": 2})
    subscription: Literal["Prepaid", "Postpaid"] = Field(default="Prepaid", description="Prepaid or Postpaid contract type", json_schema_extra={"example": "Prepaid"})
    tenureMonths: int = Field(..., description="Subscriber relationship tenure in months", json_schema_extra={"example": 8})
    usageDropPct: Optional[float] = Field(default=0.0, description="Month-over-month usage decrease percentage", json_schema_extra={"example": 45.0})

class RiskFactorItem(BaseModel):
    factor: str
    shapValue: str
    rawShap: Optional[float] = None
    impactPct: int
    description: str
    direction: Optional[str] = "increases_churn_risk"

class ChurnPredictionResponse(BaseModel):
    churnProbability: float
    riskLevel: str
    riskFactors: List[RiskFactorItem]
    recommendedAction: str
    retentionImpactEstimate: str
    explanationMethod: str
