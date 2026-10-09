"use client";
import { CheckCircle2 } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { money } from "@/lib/utils";
import { Badge } from "@/components/marketplace";
export function AdminPlans() {
  const { state, update, notify } = useMarketplace();
  return (
    <div className="ms-pricing-grid">
      {state.plans.map((p) => (
        <div
          className={"ms-pricing-card " + (p.id === "silver" ? "featured" : "")}
          key={p.id}
        >
          {p.id === "silver" && <Badge tone="amber">Popular choice</Badge>}
          <h2>{p.name}</h2>
          <div className="ms-pricing-price">
            {money(p.price)}
            <small>/ month</small>
          </div>
          <p>Built for your next stage of growth.</p>
          <ul>
            <li>
              <CheckCircle2 size={16} />
              {p.listings} product listings
            </li>
            <li>
              <CheckCircle2 size={16} />
              {p.credits} lead credits
            </li>
            <li>
              <CheckCircle2 size={16} />
              Business profile
            </li>
            <li>
              <CheckCircle2 size={16} />
              Relevant category leads
            </li>
          </ul>
          {
            <div className="ms-form">
              {(["price", "listings", "credits"] as const).map((k) => (
                <label className="ms-field" key={k}>
                  {k}
                  <input
                    type="number"
                    min="0"
                    value={p[k]}
                    onChange={(e) => {
                      const n = Math.max(0, Number(e.target.value));
                      update((s) => ({
                        ...s,
                        plans: s.plans.map((x) =>
                          x.id === p.id ? { ...x, [k]: n } : x,
                        ),
                      }));
                    }}
                  />
                </label>
              ))}
            </div>
          }
        </div>
      ))}
    </div>
  );
}
