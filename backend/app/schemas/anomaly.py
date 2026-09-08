from pydantic import BaseModel, Field
from typing import List

class AnomalyPredictionRequest(BaseModel):
    cellId: str = Field(default="DZ-CELL-1042", description="Cell sector alphanumeric ID", json_schema_extra={"example": "DZ-CELL-1042"})
    users: int = Field(..., description="Active connected user equipment (UEs)", json_schema_extra={"example": 1850})
    latencyMs: float = Field(..., description="Transport round-trip latency in milliseconds", json_schema_extra={"example": 88.0})
    packetLossPct: float = Field(..., description="Packet loss rate percentage", json_schema_extra={"example": 3.4})
    trafficMbps: float = Field(..., description="Backhaul throughput in Mbps", json_schema_extra={"example": 920.0})
    availabilityPct: float = Field(..., description="Cell carrier availability percentage", json_schema_extra={"example": 96.8})

class AnomalyPredictionResponse(BaseModel):
    status: str
    anomalyScore: float
    confidencePct: int
    possibleCauses: List[str]
    aiIncidentSummary: str
    recommendedResolution: str
    learningType: str
