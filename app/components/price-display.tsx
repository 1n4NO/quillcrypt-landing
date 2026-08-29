import { formatMoney } from "../lib/plans";

type PriceDisplayProps = {
  amount: number;
  billingLabel: string;
  supportingLine?: string;
  secondary?: boolean;
};

export function PriceDisplay({ amount, billingLabel, supportingLine, secondary = false }: PriceDisplayProps) {
  const formattedAmount = formatMoney(amount);
  const accessibleLabel = `${formattedAmount} ${billingLabel}${supportingLine ? `. ${supportingLine}` : ""}`;

  return (
    <div className={`price-display${secondary ? " price-display-secondary" : ""}`} aria-label={accessibleLabel}>
      <span className="price-amount" aria-hidden="true">{formattedAmount}</span>
      <span className="price-qualifier" aria-hidden="true">{billingLabel}</span>
      {supportingLine ? <strong className="price-supporting" aria-hidden="true">{supportingLine}</strong> : null}
    </div>
  );
}
