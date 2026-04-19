export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  image: string;
};

export const HEADLINES: readonly NewsItem[] = [
  {
    id: "01",
    image: "/news/01.png",
    headline: "US slaps 25% tariff on semiconductor imports; chip stocks slide 6%.",
    summary:
      "Tariff targets chips from Taiwan, South Korea, and China. Nvidia, AMD, and Intel fall sharply in pre-market; Indian chip exporters mostly spared.",
  },
  {
    id: "02",
    image: "/news/02.png",
    headline: "New Income Tax Act to come into effect April 1, 2026.",
    summary:
      "Replaces the 1961 Act. Simplified slabs, fewer exemptions, and a rewritten TDS framework. New ITR forms drop next month.",
  },
  {
    id: "03",
    image: "/news/03.png",
    headline: "RBI cuts repo rate by 50bps; home loan EMIs set to drop.",
    summary:
      "Biggest cut in four years. Floating-rate home and auto loans reprice within 3 months. FD rates expected to fall in tandem.",
  },
  {
    id: "04",
    image: "/news/04.png",
    headline: "Centre announces ₹15,000 cr fertilizer subsidy for kharif season.",
    summary:
      "Urea and DAP prices held flat for farmers. Subsidy covers Jun–Sep sowing. IFFCO, Chambal, and Coromandel seen as direct beneficiaries.",
  },
  {
    id: "05",
    image: "/news/05.png",
    headline: "India Semiconductor Mission (ISM) 2.0 launched with ₹1,000cr outlay.",
    summary:
      "Fresh PLI for design-linked startups. Focus on chip fabs in Gujarat and Assam. Global giants Micron and Tata Electronics expanding India footprint.",
  },
  {
    id: "06",
    image: "/news/06.png",
    headline: "Gold and Silver rates crash by 9% on February 1.",
    summary:
      "Budget slashes customs duty from 15% to 6%. Gold drops ₹5,500/10g overnight. Jewellers report record walk-ins; sovereign gold bond holders hit.",
  },
  {
    id: "07",
    image: "/news/07.png",
    headline: "Bengaluru rents rise 18% YoY; Whitefield and Sarjapur lead surge.",
    summary:
      "2BHK rents now ₹45–60k in IT corridors. Broker fees and 10-month deposits return. HSR and Indiranagar up 22%; Electronic City relatively stable.",
  },
  {
    id: "08",
    image: "/news/08.png",
    headline: "CBSE announces sweeping changes to Class 10 board exam pattern.",
    summary:
      "Two board exams a year from 2026. More MCQs, less rote. Internal assessment weight doubles. Affects 22 lakh students across India.",
  },
  {
    id: "09",
    image: "/news/09.png",
    headline: "Ola and Uber fares capped at ₹25/km during peak hours in metros.",
    summary:
      "Govt rule across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai. Surge pricing banned 8–11am and 6–10pm. Drivers warn of longer wait times.",
  },
  {
    id: "10",
    image: "/news/10.png",
    headline: "Layoffs at major US tech firms hit 40,000 in Q1; India offices spared.",
    summary:
      "Google, Meta, Amazon, Microsoft trim US headcount. India GCCs continue hiring, especially for AI and platform roles. H-1B renewals getting tougher.",
  },
  {
    id: "11",
    image: "/news/11.png",
    headline: "SEBI bans weekly F&O expiries on Nifty and Bank Nifty from May 1.",
    summary:
      "Only monthly expiries allowed. Retail options volume expected to halve. Brokers like Zerodha and Angel One face revenue hit.",
  },
  {
    id: "12",
    image: "/news/12.png",
    headline: "Tax holiday till 2047 for foreign companies using Indian Data Centres.",
    summary:
      "Zero corporate tax for 22 years on India-hosted workloads. AWS, Azure, Google Cloud fast-tracking Mumbai and Hyderabad regions. Big win for local DC operators.",
  },
] as const;
