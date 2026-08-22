"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Frequency = "monthly" | "quarterly" | "yearly";
type Bill = {
  id: number;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  dueDay: number;
  color: string;
};

type Profile = {
  income: number;
  savingsTarget: number;
  flexibleSpent: number;
  daysUntilPayday: number;
};

const initialProfile: Profile = {
  income: 2950,
  savingsTarget: 400,
  flexibleSpent: 238,
  daysUntilPayday: 13,
};

const starterBills: Bill[] = [
  { id: -1, name: "Rent & utilities", amount: 910, frequency: "monthly", category: "Home", dueDay: 1, color: "violet" },
  { id: -2, name: "Groceries baseline", amount: 390, frequency: "monthly", category: "Food", dueDay: 5, color: "orange" },
  { id: -3, name: "Insurance bundle", amount: 960, frequency: "yearly", category: "Insurance", dueDay: 12, color: "blue" },
  { id: -4, name: "Car service & tyres", amount: 720, frequency: "yearly", category: "Transport", dueDay: 18, color: "green" },
  { id: -5, name: "Phone & subscriptions", amount: 86, frequency: "monthly", category: "Digital", dueDay: 22, color: "pink" },
  { id: -6, name: "Dog care reserve", amount: 480, frequency: "yearly", category: "Family", dueDay: 27, color: "yellow" },
];

const euro = new Intl.NumberFormat("en-AT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function monthlyCost(bill: Bill) {
  if (bill.frequency === "yearly") return bill.amount / 12;
  if (bill.frequency === "quarterly") return bill.amount / 3;
  return bill.amount;
}

function pct(value: number, total: number) {
  return total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
}

export default function Home() {
  const [bills, setBills] = useState<Bill[]>(starterBills);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [purchase, setPurchase] = useState(180);
  const [drawer, setDrawer] = useState<"bill" | "plan" | null>(null);
  const [view, setView] = useState<"overview" | "calendar" | "plan">("overview");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/bills").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/profile").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([billData, profileData]) => {
        if (billData.bills?.length) setBills(billData.bills);
        if (profileData.profile) setProfile(profileData.profile);
      })
      .catch(() => {});
  }, []);

  const math = useMemo(() => {
    const fixed = bills
      .filter((bill) => bill.frequency === "monthly")
      .reduce((sum, bill) => sum + monthlyCost(bill), 0);
    const sinking = bills
      .filter((bill) => bill.frequency !== "monthly")
      .reduce((sum, bill) => sum + monthlyCost(bill), 0);
    const safe = profile.income - fixed - sinking - profile.savingsTarget - profile.flexibleSpent;
    const daily = safe / Math.max(1, profile.daysUntilPayday);
    return { fixed, sinking, safe, daily, committed: fixed + sinking + profile.savingsTarget };
  }, [bills, profile]);

  const afterPurchase = math.safe - purchase;
  const purchaseDays = purchase / Math.max(1, math.daily);

  async function addBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      amount: Number(form.get("amount") || 0),
      frequency: String(form.get("frequency") || "monthly"),
      category: String(form.get("category") || "Other"),
      dueDay: Number(form.get("dueDay") || 1),
      color: String(form.get("color") || "blue"),
    };
    const optimistic: Bill = { ...payload, id: Date.now(), frequency: payload.frequency as Frequency };
    setBills((current) => [...current.filter((bill) => bill.id > 0), optimistic]);
    setDrawer(null);
    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.bill) {
        setBills((current) => current.map((bill) => (bill.id === optimistic.id ? data.bill : bill)));
      }
    } catch {}
  }

  async function removeBill(id: number) {
    setBills((current) => current.filter((bill) => bill.id !== id));
    if (id > 0) await fetch("/api/bills/" + id, { method: "DELETE" }).catch(() => {});
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: Profile = {
      income: Number(form.get("income")),
      savingsTarget: Number(form.get("savingsTarget")),
      flexibleSpent: Number(form.get("flexibleSpent")),
      daysUntilPayday: Number(form.get("daysUntilPayday")),
    };
    setProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    setDrawer(null);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="logo"><span>M</span><strong>margin</strong></div>
        <p className="side-label">YOUR MONEY</p>
        <nav>
          <button className={view === "overview" ? "active" : ""} onClick={() => setView("overview")}><Icon name="grid" /> Overview</button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><Icon name="calendar" /> Money calendar</button>
          <button className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}><Icon name="layers" /> Commitments <b>{bills.length}</b></button>
        </nav>
        <p className="side-label">DECISIONS</p>
        <nav>
          <button onClick={() => document.getElementById("afford")?.scrollIntoView({ behavior: "smooth" })}><Icon name="spark" /> Can I afford it?</button>
          <button onClick={() => setDrawer("plan")}><Icon name="sliders" /> Adjust my plan</button>
        </nav>
        <div className="evidence-card">
          <span>WHY MARGIN EXISTS</span>
          <strong>1 in 3</strong>
          <p>Austrian households built no financial reserve in Q3 2025.</p>
          <a href="https://www.statistik.at/fileadmin/announcement/2025/12/20251217sozialeKrisenfolgen2025Q3EN.pdf" target="_blank" rel="noreferrer">Statistics Austria ↗</a>
        </div>
        <div className="user"><span>MK</span><div><strong>Mario</strong><small>Personal plan</small></div><button>•••</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>HOUSEHOLD CONTROL CENTRE</p>
            <h1>Good morning, Mario.</h1>
          </div>
          <div className="top-actions">
            {saved && <span className="saved">✓ Plan saved</span>}
            <button className="ghost"><Icon name="bell" /></button>
            <button className="primary" onClick={() => setDrawer("bill")}>＋ Add commitment</button>
          </div>
        </header>

        <section className="hero-grid">
          <article className="safe-card">
            <div className="card-head"><span>SAFE TO SPEND</span><button title="The money left after all commitments and reserves">?</button></div>
            <div className="safe-main">
              <div>
                <h2>{euro.format(Math.max(0, math.safe))}</h2>
                <p>freely available until your next payday</p>
              </div>
              <div className="health-ring" style={{ "--fill": pct(math.committed + profile.flexibleSpent, profile.income) + "%" } as React.CSSProperties}>
                <span><b>{Math.round(pct(math.safe, profile.income))}%</b><small>margin</small></span>
              </div>
            </div>
            <div className="daily-strip">
              <div><span>{euro.format(math.daily)}</span><small>safe per day</small></div>
              <div><span>{profile.daysUntilPayday} days</span><small>until payday</small></div>
              <div><span>{euro.format(profile.savingsTarget)}</span><small>protected savings</small></div>
            </div>
          </article>

          <article className="formula-card">
            <div className="card-head"><span>THE HONEST MATH</span><button onClick={() => setDrawer("plan")}>Edit</button></div>
            <div className="formula-row income"><i>＋</i><div><b>Net income</b><small>Monthly take-home</small></div><strong>{euro.format(profile.income)}</strong></div>
            <div className="formula-row"><i>−</i><div><b>Fixed life</b><small>Rent, food, subscriptions</small></div><strong>{euro.format(math.fixed)}</strong></div>
            <div className="formula-row"><i>−</i><div><b>Future bills</b><small>Annual costs ÷ 12</small></div><strong>{euro.format(math.sinking)}</strong></div>
            <div className="formula-row"><i>−</i><div><b>Future you</b><small>Monthly savings target</small></div><strong>{euro.format(profile.savingsTarget)}</strong></div>
            <div className="formula-row"><i>−</i><div><b>Already spent</b><small>Flexible spending this cycle</small></div><strong>{euro.format(profile.flexibleSpent)}</strong></div>
          </article>
        </section>

        <section className="insight-row">
          <article><span className="insight-icon calm"><Icon name="shield" /></span><div><small>SHOCK ABSORBER</small><strong>{euro.format(math.sinking * 12)}</strong><p>of irregular bills covered per year</p></div><em>Protected</em></article>
          <article><span className="insight-icon warn"><Icon name="pulse" /></span><div><small>PRESSURE POINT</small><strong>{Math.round(pct(math.fixed, profile.income))}%</strong><p>of income goes to fixed life</p></div><em className="amber">Watch</em></article>
          <article><span className="insight-icon mint"><Icon name="trend" /></span><div><small>12-MONTH OUTLOOK</small><strong>{euro.format(profile.savingsTarget * 12)}</strong><p>saved if this plan holds</p></div><em>On track</em></article>
        </section>

        <section className="lower-grid">
          <article className="commitments">
            <div className="section-head">
              <div><span>COMMITMENT MAP</span><h3>Where your month really goes</h3></div>
              <button onClick={() => setView(view === "plan" ? "overview" : "plan")}>{view === "plan" ? "Compact view" : "Manage all"} →</button>
            </div>
            <div className="bar">
              <i className="home" style={{ width: pct(bills.filter((b) => b.category === "Home").reduce((s, b) => s + monthlyCost(b), 0), profile.income) + "%" }} />
              <i className="food" style={{ width: pct(bills.filter((b) => b.category === "Food").reduce((s, b) => s + monthlyCost(b), 0), profile.income) + "%" }} />
              <i className="future" style={{ width: pct(math.sinking, profile.income) + "%" }} />
              <i className="saving" style={{ width: pct(profile.savingsTarget, profile.income) + "%" }} />
            </div>
            <div className="legend"><span><i className="home" /> Home</span><span><i className="food" /> Living</span><span><i className="future" /> Future bills</span><span><i className="saving" /> Savings</span></div>
            <div className="bill-list">
              {bills
                .slice()
                .sort((a, b) => a.dueDay - b.dueDay)
                .slice(0, view === "plan" ? bills.length : 5)
                .map((bill) => (
                  <div className="bill" key={bill.id}>
                    <span className={"bill-icon " + bill.color}>{bill.name.charAt(0)}</span>
                    <div><strong>{bill.name}</strong><small>{bill.category} · due day {bill.dueDay}</small></div>
                    <div className="bill-money"><strong>{euro.format(monthlyCost(bill))}</strong><small>{bill.frequency === "monthly" ? "monthly" : euro.format(bill.amount) + " " + bill.frequency}</small></div>
                    {view === "plan" && <button className="remove" onClick={() => removeBill(bill.id)}>×</button>}
                  </div>
                ))}
            </div>
          </article>

          <article className="afford" id="afford">
            <div className="section-head"><div><span>DECISION ENGINE</span><h3>Can I afford it?</h3></div><Icon name="spark" /></div>
            <p className="muted">Test a purchase against your real margin, not your bank balance.</p>
            <label className="amount-input"><span>Purchase price</span><div>€<input type="number" min="0" value={purchase} onChange={(e) => setPurchase(Number(e.target.value))} /></div></label>
            <div className={"decision " + (afterPurchase >= 0 ? "yes" : "no")}>
              <div><span>{afterPurchase >= 0 ? "✓" : "!"}</span><p><strong>{afterPurchase >= 0 ? "Yes — with room left." : "Not safely this cycle."}</strong><small>{afterPurchase >= 0 ? euro.format(afterPurchase) + " would remain protected." : euro.format(Math.abs(afterPurchase)) + " would come from reserved money."}</small></p></div>
              <div className="impact"><span>Cost in life-days</span><strong>{purchaseDays.toFixed(1)} days</strong></div>
            </div>
            <div className="range-labels"><span>€0</span><span>Your safe limit: {euro.format(Math.max(0, math.safe))}</span></div>
            <input className="range" type="range" min="0" max={Math.max(1000, Math.ceil(math.safe * 2))} value={purchase} onChange={(e) => setPurchase(Number(e.target.value))} />
          </article>
        </section>

        <footer><span>Margin uses planning mathematics, not financial advice.</span><span>Every euro gets one job.</span></footer>
      </section>

      {drawer && (
        <div className="overlay" onMouseDown={() => setDrawer(null)}>
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            {drawer === "bill" ? <BillForm onSubmit={addBill} onClose={() => setDrawer(null)} /> : <PlanForm profile={profile} onSubmit={savePlan} onClose={() => setDrawer(null)} />}
          </aside>
        </div>
      )}
    </main>
  );
}

function BillForm({ onSubmit, onClose }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <form onSubmit={onSubmit}>
      <DrawerHead kicker="NEW COMMITMENT" title="Give every future euro a job." close={onClose} />
      <label>Name<input name="name" required autoFocus placeholder="e.g. Car insurance" /></label>
      <div className="form-grid"><label>Amount (€)<input name="amount" required type="number" min="1" step="0.01" placeholder="480" /></label><label>Frequency<select name="frequency"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></label></div>
      <div className="form-grid"><label>Category<select name="category">{["Home", "Food", "Transport", "Insurance", "Digital", "Family", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Due day<input name="dueDay" type="number" min="1" max="31" defaultValue="15" /></label></div>
      <label>Colour<select name="color"><option value="blue">Blue</option><option value="green">Green</option><option value="orange">Orange</option><option value="violet">Violet</option><option value="pink">Pink</option></select></label>
      <div className="math-note"><Icon name="divide" /><p><strong>We normalize it automatically.</strong><span>A €960 yearly bill becomes an €80 monthly reserve.</span></p></div>
      <button className="primary full">Add to my plan</button>
    </form>
  );
}

function PlanForm({ profile, onSubmit, onClose }: { profile: Profile; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <form onSubmit={onSubmit}>
      <DrawerHead kicker="PLAN SETTINGS" title="Adjust the four numbers that matter." close={onClose} />
      <label>Monthly net income<input name="income" type="number" min="0" step="10" defaultValue={profile.income} /></label>
      <label>Protected monthly savings<input name="savingsTarget" type="number" min="0" step="10" defaultValue={profile.savingsTarget} /></label>
      <label>Flexible spending so far<input name="flexibleSpent" type="number" min="0" step="1" defaultValue={profile.flexibleSpent} /></label>
      <label>Days until next payday<input name="daysUntilPayday" type="number" min="1" max="45" defaultValue={profile.daysUntilPayday} /></label>
      <div className="math-note"><Icon name="shield" /><p><strong>Reserved stays reserved.</strong><span>Margin never counts bill money or savings as spendable.</span></p></div>
      <button className="primary full">Recalculate my margin</button>
    </form>
  );
}

function DrawerHead({ kicker, title, close }: { kicker: string; title: string; close: () => void }) {
  return <div className="drawer-head"><div><span>{kicker}</span><h2>{title}</h2></div><button type="button" onClick={close}>×</button></div>;
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = { grid: "▦", calendar: "◫", layers: "≡", spark: "✦", sliders: "⌁", bell: "♢", shield: "◈", pulse: "⌁", trend: "↗", divide: "÷" };
  return <i className="ui-icon" aria-hidden="true">{icons[name] || "·"}</i>;
}
