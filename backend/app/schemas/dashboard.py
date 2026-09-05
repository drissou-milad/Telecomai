from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    networkHealth: float
    activeUsers: int
    highRiskCustomers: int
    mediumRiskCustomers: int
    totalCustomersScored: int
    churnRatePct: float
    averageChurnProbabilityPct: float
    revenueAtRiskDZD: float
    networkAnomalies: int
    totalCellsMonitored: int
    averageLatencyMs: float
    packetLossAvgPct: float
