export const CAREER_OPTIONS = [
  "IT Professional — mid-career software engineer",
  "Small business owner — retail store",
  "Government employee — central services",
  "Early-career marketing professional",
  "Retired — former banker",
] as const;

export const FINANCIAL_OPTIONS = [
  "Active retail investor (stocks + F&O), salaried",
  "Conservative saver — FDs and PPF only",
  "Crypto-heavy portfolio, high risk appetite",
  "Mutual fund SIP investor, salaried",
  "No investments — lives paycheck to paycheck",
] as const;

export const LIFE_STAGE_OPTIONS = [
  "30, urban renter, no kids",
  "38, homeowner in Mumbai, two kids in school",
  "60, retired homeowner, dependents",
  "25, single, lives with parents",
  "45, single parent, urban tenant",
] as const;

export type PersonaPreset = {
  label: string;
  career: (typeof CAREER_OPTIONS)[number];
  financialProfile: (typeof FINANCIAL_OPTIONS)[number];
  lifeStage: (typeof LIFE_STAGE_OPTIONS)[number];
};

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    label: "IT engineer in Bengaluru",
    career: "IT Professional — mid-career software engineer",
    financialProfile: "Active retail investor (stocks + F&O), salaried",
    lifeStage: "30, urban renter, no kids",
  },
  {
    label: "Retired homeowner in Mumbai",
    career: "Retired — former banker",
    financialProfile: "Conservative saver — FDs and PPF only",
    lifeStage: "60, retired homeowner, dependents",
  },
  {
    label: "Mumbai parent, two kids",
    career: "Government employee — central services",
    financialProfile: "Mutual fund SIP investor, salaried",
    lifeStage: "38, homeowner in Mumbai, two kids in school",
  },
  {
    label: "Crypto-curious Gen Z",
    career: "Early-career marketing professional",
    financialProfile: "Crypto-heavy portfolio, high risk appetite",
    lifeStage: "25, single, lives with parents",
  },
  {
    label: "Shopkeeper, single parent",
    career: "Small business owner — retail store",
    financialProfile: "No investments — lives paycheck to paycheck",
    lifeStage: "45, single parent, urban tenant",
  },
];
