export type NewsItem = {
  id: string;
  headline: string;
  image: string;
};

export const HEADLINES: readonly NewsItem[] = [
  { id: "01", image: "/news/01.png", headline: "US slaps 25% tariff on semiconductor imports; chip stocks slide 6%." },
  { id: "02", image: "/news/02.png", headline: "New Income Tax Act to come into effect April 1, 2026." },
  { id: "03", image: "/news/03.png", headline: "RBI cuts repo rate by 50bps; home loan EMIs set to drop." },
  { id: "04", image: "/news/04.png", headline: "Centre announces ₹15,000 cr fertilizer subsidy for kharif season." },
  { id: "05", image: "/news/05.png", headline: "India Semiconductor Mission (ISM) 2.0 launched with ₹1,000cr outlay." },
  { id: "06", image: "/news/06.png", headline: "Gold and Silver rates crash by 9% on February 1." },
  { id: "07", image: "/news/07.png", headline: "Bengaluru rents rise 18% YoY; Whitefield and Sarjapur lead surge." },
  { id: "08", image: "/news/08.png", headline: "CBSE announces sweeping changes to Class 10 board exam pattern." },
  { id: "09", image: "/news/09.png", headline: "Ola and Uber fares capped at ₹25/km during peak hours in metros." },
  { id: "10", image: "/news/10.png", headline: "Layoffs at major US tech firms hit 40,000 in Q1; India offices spared." },
  { id: "11", image: "/news/11.png", headline: "SEBI bans weekly F&O expiries on Nifty and Bank Nifty from May 1." },
  { id: "12", image: "/news/12.png", headline: "Tax holiday till 2047 for foreign companies using Indian Data Centres." },
] as const;
