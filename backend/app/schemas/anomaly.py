from pydantic import BaseModel, Field
from typing import List

class AnomalyPredictionRequest(BaseModel):
    cellId: str = Field(default="DZ-CELL-1042", description="Cell sector alphanumeric ID", example="DZ-CELL-1042")
    users: int = Field(..., description="Active connected user equipment (UEs)", example=1850)
    latencyMs: float = Field(..., description="Transport round-trip latency in milliseconds", example=88.0)
    packetLossPct: float = Field(..., description="Packet loss rate percentage", example=3.4)
    trafficMbps: float = Field(..., description="Backhaul throughput in Mbps", example=920.0)
    availabilityPct: float = Field(..., description="Cell carrier availability percentage", example=96.8)

class AnomalyPredictionResponse(BaseModel):
    status: str
    anomalyScore: float
    confidencePct: int
    possibleCauses: List[str]
    aiIncidentSummary: str
    recommendedResolution: str
    learningType: str
