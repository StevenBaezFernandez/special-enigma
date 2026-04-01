export interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPriceId: string;
  description?: string;
  price?: number;
  features?: string[];
  annualPriceId?: string;
}
