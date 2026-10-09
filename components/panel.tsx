"use client";
import Link from "next/link";
import { ShieldCheck, Download, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { categories, type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
import { Empty } from "@/components/empty";
import { AdminLeadList } from "./leads-list";
import { AdminDashboard } from "./dashboard";
import { AdminClaims } from "./claims";
import { AdminPlans } from "./plans";
export function AdminPanel({ path }: { path: string[] }) {
  const role = "admin" as Role;
  const { state, update, notify } = useMarketplace();
  const section = path[0] || "dashboard";
  const seller = state.sellers[0];
  if (section === "dashboard") return <AdminDashboard />;
  if (section === "leads")
    return (
      <>
        <PageHeading
          title={"Lead management"}
          description={
            "Approve requirements, set prices, and manage supplier access."
          }
        />

        <AdminLeadList purchased={path[1] === "purchased"} />
      </>
    );
  if (section === "products") {
    const list = state.products.filter((p) => true);
    return (
      <>
        <PageHeading
          title={"Product listings"}
          description="Manage catalogue visibility and product information."
        />
        <div className="ms-card ms-table-wrap">
          <table className="ms-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={"/products/" + p.id}
                      className="ms-table-product"
                    >
                      <img src={p.image} alt="" />
                      <strong>{p.name}</strong>
                    </Link>
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.price)}</td>
                  <td>
                    <Badge tone={p.status === "Active" ? "green" : ""}>
                      {p.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="ms-table-actions">
                      <button
                        onClick={() =>
                          update((s) => ({
                            ...s,
                            products: s.products.map((x) =>
                              x.id === p.id
                                ? {
                                    ...x,
                                    status:
                                      x.status === "Active"
                                        ? "Inactive"
                                        : "Active",
                                  }
                                : x,
                            ),
                          }))
                        }
                      >
                        {p.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (section === "kyc")
    return (
      <>
        <PageHeading
          title={"Seller KYC review"}
          description="KYC is manually reviewed. Documents are private and never part of the public catalogue."
        />
        {
          <div className="ms-card">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {state.sellers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.company}</strong>
                      <small>{s.name}</small>
                    </td>
                    <td>{s.city}</td>
                    <td>
                      <Badge tone={s.kyc === "Approved" ? "green" : "amber"}>
                        {s.kyc}
                      </Badge>
                    </td>
                    <td>
                      <select
                        aria-label={"KYC status for " + s.company}
                        value={s.kyc}
                        onChange={(e) => {
                          const kyc = e.target.value;
                          update((st) => ({
                            ...st,
                            sellers: st.sellers.map((x) =>
                              x.id === s.id ? { ...x, kyc } : x,
                            ),
                          }));
                          notify("KYC decision saved in preview.");
                        }}
                      >
                        {[
                          "Not Submitted",
                          "Submitted",
                          "Under Review",
                          "Additional Documents Required",
                          "Approved",
                          "Rejected",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ms-form-note">
              Preview decisions use sample businesses. No real KYC documents
              have been uploaded.
            </p>
          </div>
        }
      </>
    );
  if (section === "subscription" || section === "subscriptions")
    return (
      <>
        <PageHeading
          title={"Subscription plans"}
          description="Listing limits and lead credits that fit your business. Monthly plans."
        />
        <AdminPlans />
      </>
    );
  if (section === "sellers")
    return (
      <>
        <PageHeading
          title="Supplier management"
          description="Verification, subscription plans, and business visibility."
        />
        <div className="ms-card ms-table-wrap">
          <table className="ms-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>KYC</th>
                <th>Plan</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {state.sellers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={"/suppliers/" + s.id}>
                      <strong>{s.company}</strong>
                      <small>
                        {s.city} · {s.email}
                      </small>
                    </Link>
                  </td>
                  <td>{s.category}</td>
                  <td>
                    <Badge tone="green">{s.kyc}</Badge>
                  </td>
                  <td>
                    <select
                      aria-label={"Plan for " + s.company}
                      value={s.plan}
                      onChange={(e) => {
                        const plan = e.target.value;
                        update((st) => ({
                          ...st,
                          sellers: st.sellers.map((x) =>
                            x.id === s.id ? { ...x, plan } : x,
                          ),
                        }));
                      }}
                    >
                      {state.plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      aria-label={"Credits for " + s.company}
                      className="ms-number-input"
                      min="0"
                      type="number"
                      value={s.credits}
                      onChange={(e) => {
                        const credits = Math.max(0, Number(e.target.value));
                        update((st) => ({
                          ...st,
                          sellers: st.sellers.map((x) =>
                            x.id === s.id ? { ...x, credits } : x,
                          ),
                        }));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  if (section === "buyers")
    return (
      <>
        <PageHeading
          title="Buyer management"
          description="Buyer profiles and sourcing activity."
        />
        <div className="ms-card">
          <table className="ms-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Company</th>
                <th>City</th>
                <th>Requirements</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{state.profile.name}</strong>
                  <small>{state.profile.email}</small>
                </td>
                <td>{state.profile.company}</td>
                <td>{state.profile.city}</td>
                <td>
                  {
                    state.leads.filter((l) => l.email === state.profile.email)
                      .length
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  if (section === "categories")
    return (
      <>
        <PageHeading
          title="Industry categories"
          description="Categories used for supplier discovery and relevant lead matching."
        />
        <div className="ms-category-grid">
          {categories.map((c) => (
            <div className="ms-card" key={c}>
              <h3>{c}</h3>
              <p>
                {state.products.filter((p) => p.category === c).length} products
                · {state.leads.filter((l) => l.category === c).length}{" "}
                requirements
              </p>
            </div>
          ))}
        </div>
      </>
    );
  if (section === "claims") return <AdminClaims />;
  if (section === "protection")
    return (
      <>
        <PageHeading
          title="Buyer Protection"
          description="Track protection for eligible negotiated transactions. Every claim is manually reviewed."
        />
        <div className="ms-card">
          <ShieldCheck size={40} className="ms-green-icon" />
          <h2>Confidence for your next business deal</h2>
          <p>
            Record your deal, agreed delivery date, invoice, and payment
            evidence. If a covered deal fails, submit a claim for admin review.
            Your supplier has the right to respond.
          </p>
          <div className="ms-detail-grid">
            <div>
              <small>Sample deal</small>
              <strong>DEAL-204</strong>
            </div>
            <div>
              <small>Supplier</small>
              <strong>Naresh Textiles</strong>
            </div>
            <div>
              <small>Deal value</small>
              <strong>{money(600000)}</strong>
            </div>
            <div>
              <small>Protection status</small>
              <Badge tone="green">Sample active record</Badge>
            </div>
          </div>
          <Button asChild>
            <Link href={"/" + role + "/claims"}>
              View claims <ArrowRight size={15} />
            </Link>
          </Button>
          <p className="ms-form-note">
            Live protection purchases require configured plans, legal terms, and
            Razorpay. Sample records are for design review.
          </p>
        </div>
      </>
    );
  if (section === "refunds")
    return (
      <>
        <PageHeading
          title="Refund tracking"
          description="Track manually approved compensation and processing references."
        />
        <div className="ms-card">
          <table className="ms-table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Approved amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.claims
                .filter((c) => ["Approved", "Resolved"].includes(c.status))
                .map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{money(c.amount)}</td>
                    <td>
                      <Badge tone="amber">
                        {c.status === "Resolved"
                          ? "Recorded as resolved"
                          : "Awaiting processing"}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!state.claims.some((c) =>
            ["Approved", "Resolved"].includes(c.status),
          ) && (
            <Empty
              title="No approved compensation yet"
              description="Approved claims will appear here. No automatic refunds are issued."
            />
          )}
        </div>
      </>
    );
  if (section === "cms")
    return (
      <>
        <PageHeading
          title="Website content"
          description="Edit public information in the browser preview."
        />
        <div className="ms-card ms-form">
          {Object.entries(state.cms).map(([key, value]) => (
            <label className="ms-field" key={key}>
              {key.toUpperCase()}
              <textarea
                rows={4}
                value={value}
                onChange={(e) => {
                  const value = e.target.value;
                  update((s) => ({ ...s, cms: { ...s.cms, [key]: value } }));
                }}
              />
            </label>
          ))}
          <Button
            onClick={() =>
              notify("Content saved. Public pages use these preview values.")
            }
          >
            Save content
          </Button>
        </div>
      </>
    );
  if (section === "notifications")
    return (
      <>
        <PageHeading
          title="Notifications"
          description="Recent marketplace activity."
        />
        <div className="ms-card">
          {state.activity.map((a, i) => (
            <div className="ms-activity" key={i}>
              <CheckCircle2 size={18} />
              <p>{a}</p>
            </div>
          ))}
        </div>
      </>
    );
  if (section === "reports")
    return (
      <>
        <PageHeading
          title="Reports & analytics"
          description="Current sample marketplace activity. Export a CSV for review."
          action={
            <Button
              onClick={() => {
                const rows = [
                  "Metric,Value",
                  `Suppliers,${state.sellers.length}`,
                  `Products,${state.products.length}`,
                  `Requirements,${state.leads.length}`,
                  `Lead unlocks,${state.leads.reduce((n, l) => n + l.purchases.length, 0)}`,
                  `Claims,${state.claims.length}`,
                ];
                const url = URL.createObjectURL(
                  new Blob([rows.join("\n")], { type: "text/csv" }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "mandisetu-preview-report.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} /> Export CSV
            </Button>
          }
        />
        <div className="ms-card">
          <h2>Requirements by category</h2>
          <div className="ms-chart">
            {categories
              .filter((c) => state.leads.some((l) => l.category === c))
              .map((c) => (
                <div key={c}>
                  <span>{c}</span>
                  <div className="ms-chart-track">
                    <i
                      style={{
                        width:
                          (state.leads.filter((l) => l.category === c).length /
                            state.leads.length) *
                            100 +
                          "%",
                      }}
                    />
                  </div>
                  <strong>
                    {state.leads.filter((l) => l.category === c).length}
                  </strong>
                </div>
              ))}
          </div>
        </div>
      </>
    );
  if (section === "settings")
    return (
      <>
        <PageHeading
          title="Marketplace settings"
          description="V1 business rules and environment configuration."
        />
        <div className="ms-card">
          <div className="ms-detail-grid">
            <div>
              <small>Maximum sellers per lead</small>
              <strong>5</strong>
            </div>
            <div>
              <small>Lead credit rule</small>
              <strong>1 credit = 1 unlock</strong>
            </div>
            <div>
              <small>KYC verification</small>
              <strong>Manual admin review</strong>
            </div>
            <div>
              <small>Payment gateway</small>
              <strong>Razorpay · not connected</strong>
            </div>
          </div>
          <p>
            Secrets and service credentials belong in server environment
            variables. See the project setup documentation.
          </p>
        </div>
      </>
    );
  if (section === "payments" || section === "enquiries")
    return (
      <>
        <PageHeading
          title={
            section === "payments" ? "Payment history" : "Business enquiries"
          }
          description={
            section === "payments"
              ? "Verified transactions and invoices will appear here."
              : "Direct enquiries from buyers will appear here."
          }
        />
        <div className="ms-card">
          <Empty
            title={
              section === "payments"
                ? "No live payments connected"
                : "No enquiries yet"
            }
            description={
              section === "payments"
                ? "Preview credit unlocks do not create payment transactions. Configure Razorpay to enable live payments."
                : "Keep your catalogue complete so buyers can discover your business."
            }
          />
        </div>
      </>
    );
  return <Empty title="Page not found" />;
}
