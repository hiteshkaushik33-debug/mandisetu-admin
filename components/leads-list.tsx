"use client";
import { FileText } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { money } from "@/lib/utils";
import { Badge } from "@/components/marketplace";
export function AdminLeadList({
  purchased = false,
  limit,
}: {
  purchased?: boolean;
  limit?: number;
}) {
  const { state, unlock, update, notify } = useMarketplace();
  const seller = state.sellers[0];
  const leads = state.leads.filter((l) => true).slice(0, limit);
  return (
    <div className="ms-lead-list">
      {leads.map((l) => {
        const unlocked = l.purchases.includes(seller.id);
        return (
          <article className="ms-lead-card" key={l.id}>
            <div className="ms-lead-top">
              <Badge
                tone={
                  l.status === "Fully Sold"
                    ? ""
                    : l.status === "Pending"
                      ? "amber"
                      : "green"
                }
              >
                {l.status}
              </Badge>
              <small>{l.id}</small>
            </div>
            <h3>{l.title}</h3>
            <p>
              {l.city} · {l.category}
            </p>
            <div className="ms-lead-facts">
              <div>
                <small>Quantity</small>
                <strong>
                  {l.quantity.toLocaleString("en-IN")} {l.unit}
                </strong>
              </div>
              <div>
                <small>Buyer budget</small>
                <strong>{money(l.budget)}</strong>
              </div>
              <div>
                <small>Required by</small>
                <strong>
                  {new Date(l.date + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
            <p className="ms-lead-description">{l.description}</p>
            <div className="ms-slots">
              <span>{l.purchases.length} of 5 supplier slots filled</span>
              <strong>{5 - l.purchases.length} remaining</strong>
            </div>
            <div className="ms-progress">
              <span style={{ width: (l.purchases.length / 5) * 100 + "%" }} />
            </div>
            {
              <div className="ms-lead-admin">
                <label>
                  Lead price (₹)
                  <input
                    type="number"
                    min="0"
                    defaultValue={l.price}
                    onBlur={(e) => {
                      const price = Math.max(0, Number(e.target.value));
                      update((s) => ({
                        ...s,
                        leads: s.leads.map((x) =>
                          x.id === l.id ? { ...x, price } : x,
                        ),
                      }));
                    }}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={l.status}
                    onChange={(e) => {
                      const status = e.target.value;
                      update((s) => ({
                        ...s,
                        leads: s.leads.map((x) =>
                          x.id === l.id ? { ...x, status } : x,
                        ),
                      }));
                      notify("Lead status updated in preview.");
                    }}
                  >
                    {[
                      "Pending",
                      "Active",
                      "Partially Sold",
                      "Fully Sold",
                      "Closed",
                      "Rejected",
                      "Expired",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <p>
                  Buyer: {l.buyerName} · {l.email}
                </p>
              </div>
            }
          </article>
        );
      })}
      {!leads.length && (
        <div className="ms-empty">
          <FileText />
          <h3>No leads yet</h3>
          <p>
            {purchased
              ? "Unlocked leads will appear here."
              : "Relevant requirements will appear after admin review."}
          </p>
        </div>
      )}
    </div>
  );
}
