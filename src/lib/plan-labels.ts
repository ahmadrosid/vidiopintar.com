const planTypeLabels = new Map([
  ["monthly", "Bulanan"],
  ["yearly", "Tahunan"],
]);

export const planTypeLabel = (planType: string) => planTypeLabels.get(planType) ?? planType;
