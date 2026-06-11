import { useState, useEffect } from "react";

const C = {
  maroon:     "#6B1E2E",
  plum:       "#8B3A52",
  periwinkle: "#7B8EC8",
  offwhite:   "#F7F5F2",
  surface:    "#FFFFFF",
  text:       "#1A1A1A",
  muted:      "#6B7280",
  border:     "#E5E3E0",
  success:    "#2D7A4F",
  error:      "#B91C1C",
};

const sk = (uid, key) => `ct_${uid}_${key}`;
function dbGet(uid, key) {
  try { const v = localStorage.getItem(sk(uid, key)); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function dbSet(uid, key, value) {
  try { localStorage.setItem(sk(uid, key), JSON.stringify(value)); }
  catch (e) { console.error("Save failed", e); }
}
function getAuthStore() {
  try { const v = localStorage.getItem("ct_auth_users"); return v ? JSON.parse(v) : {}; }
  catch { return {}; }
}
function saveAuthStore(store) { localStorage.setItem("ct_auth_users", JSON.stringify(store)); }
function getCurrentUser() {
  try { const v = localStorage.getItem("ct_auth_current"); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function setCurrentUser(user) {
  if (user) localStorage.setItem("ct_auth_current", JSON.stringify(user));
  else localStorage.removeItem("ct_auth_current");
}

const CHECKLIST = [
  { id: 1,  label: "Choose your business structure",      desc: "LLC, Sole Prop, S-Corp — know the difference before you file",         category: "legal"   },
  { id: 2,  label: "Register your business name",         desc: "Check availability with your state's Secretary of State",               category: "legal"   },
  { id: 3,  label: "File your Articles of Organization",  desc: "Required to officially form your LLC with the state",                   category: "legal"   },
  { id: 4,  label: "Obtain your EIN",                     desc: "Free through IRS.gov — takes minutes online",                           category: "tax"     },
  { id: 5,  label: "Open a business bank account",        desc: "Keep personal and business finances completely separate",               category: "finance" },
  { id: 6,  label: "Set up your accounting system",       desc: "QuickBooks, Wave, or FreshBooks all work well for small businesses",    category: "finance" },
  { id: 7,  label: "Register for state and local taxes",  desc: "Nevada has no state income tax — still check local requirements",       category: "tax"     },
  { id: 8,  label: "Get required licenses and permits",   desc: "City business license, professional permits if applicable",             category: "legal"   },
  { id: 9,  label: "Set up your business address",        desc: "PO Box, virtual office, or registered agent service",                  category: "ops"     },
  { id: 10, label: "Create your operating agreement",     desc: "Especially important for multi-member LLCs",                           category: "legal"   },
  { id: 11, label: "Get business insurance",              desc: "General liability at minimum — E&O if you offer professional services", category: "ops"     },
  { id: 12, label: "Build your online presence",          desc: "Domain, website, and Google Business Profile",                         category: "brand"   },
];

const ENTITIES = [
  {
    id: "sole", name: "Sole Proprietorship",
    tagline: "Simplest structure. You are the business.",
    best: "Freelancers, side hustles, solo service providers just getting started",
    pros: ["Zero setup cost or paperwork", "Complete control over decisions", "Simple taxes — report on your personal return", "Easy to dissolve if needed"],
    cons: ["No separation between you and the business", "Personal assets at risk if sued", "Harder to get business credit or loans", "Less credibility with some clients"],
    tax: "Income reported on Schedule C of your personal tax return. Self-employment tax applies.",
    steps: ["Start operating under your own name (no filing required)", "File a DBA if using a business name", "Get an EIN (optional but recommended)", "Open a business bank account"],
  },
  {
    id: "llc", name: "LLC",
    tagline: "Limited Liability Company. The sweet spot for most small businesses.",
    best: "Consultants, small business owners, service providers who want protection without the complexity of a corporation",
    pros: ["Personal assets protected from business liability", "Flexible tax options", "Less paperwork than a corporation", "More credible to clients and vendors"],
    cons: ["Filing fees vary by state ($50-$500+)", "Annual reports required in most states", "Self-employment tax still applies", "More setup than a sole prop"],
    tax: "Taxed as a sole prop by default (pass-through). Can elect S-Corp status for tax savings at higher income levels.",
    steps: ["Choose and check your business name", "File Articles of Organization with your state", "Get your EIN from IRS.gov", "Draft an operating agreement", "Open a business bank account"],
  },
  {
    id: "scorp", name: "S-Corporation",
    tagline: "Tax-efficient structure for established businesses with consistent revenue.",
    best: "Business owners making $50K+ in profit who want to reduce self-employment tax",
    pros: ["Significant self-employment tax savings at higher income", "Personal liability protection", "Adds credibility and structure", "Easier to bring on investors or partners"],
    cons: ["Most complex to set up and maintain", "Must pay yourself a reasonable salary", "Stricter IRS requirements", "Payroll setup required"],
    tax: "Salary portion subject to payroll tax. Remaining profit passes through without SE tax — this is where the savings come from.",
    steps: ["Form an LLC or C-Corp first", "File IRS Form 2553 to elect S-Corp status", "Set up payroll for your salary", "Open business accounts and keep detailed records"],
  },
];

const RESOURCES = [
  { title: "IRS EIN Application",                desc: "Apply for your EIN — free and instant online",                              link: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online", category: "Tax"      },
  { title: "Nevada SOS — Business Registration", desc: "File your LLC or corporation with the Nevada Secretary of State",           link: "https://sos.nv.gov/businesses/main/",                                                                                   category: "Legal"    },
  { title: "Wave Accounting",                     desc: "Free invoicing, accounting, and receipt scanning for small businesses",     link: "https://www.waveapps.com",                                                                                              category: "Finance"  },
  { title: "SBA Business Plan Guide",             desc: "Step-by-step business plan builder from the Small Business Administration", link: "https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan",                                       category: "Planning" },
  { title: "SCORE Free Mentorship",               desc: "Free one-on-one mentoring from experienced business executives",           link: "https://www.score.org",                                                                                                 category: "Support"  },
  { title: "Nevada Business License Portal",      desc: "Required state business license for most Nevada-based businesses",         link: "https://sos.nv.gov/businesses/main/",                                                                                   category: "Legal"    },
  { title: "Gusto Payroll",                       desc: "Simple payroll, benefits, and HR for small businesses",                    link: "https://gusto.com",                                                                                                     category: "Finance"  },
  { title: "Google Business Profile",             desc: "Free listing that puts your business on Google Search and Maps",           link: "https://business.google.com",                                                                                           category: "Brand"    },
  { title: "Canva for Business",                  desc: "Design logos, social graphics, and marketing materials for free",          link: "https://www.canva.com",                                                                                                 category: "Brand"    },
  { title: "Nevada SBDC",                         desc: "Free advising and resources for Nevada entrepreneurs",                     link: "https://nevadasbdc.org",                                                                                                category: "Support"  },
  { title: "Clerky — Legal Documents",            desc: "Affordable legal document templates for founders and small business owners",link: "https://www.clerky.com",                                                                                               category: "Legal"    },
  { title: "QuickBooks Self-Employed",            desc: "Track income, expenses, and quarterly taxes in one place",                 link: "https://quickbooks.intuit.com/self-employed/",                                                                          category: "Finance"  },
];

const APPOINTMENTS = {
  "Mon Jun 16": ["9:00 AM", "10:30 AM", "2:00 PM"],
  "Tue Jun 17": ["11:00 AM", "1:00 PM", "3:30 PM"],
  "Wed Jun 18": ["9:00 AM", "12:00 PM"],
  "Thu Jun 19": ["10:00 AM", "2:00 PM", "4:00 PM"],
  "Fri Jun 20": ["9:30 AM", "11:00 AM"],
};

const SERVICE_TYPES = ["Business Consultation", "LLC Formation Assistance", "Document Preparation", "Notary Services", "HR Compliance Review"];

const NAV_GUEST = [
  { id: "home",      label: "Home"         },
  { id: "entities",  label: "Entity Types" },
  { id: "resources", label: "Resources"    },
];
const NAV_AUTH = [
  { id: "home",         label: "Dashboard"        },
  { id: "checklist",    label: "Startup Checklist" },
  { id: "entities",     label: "Entity Types"      },
  { id: "vault",        label: "Document Vault"    },
  { id: "appointments", label: "Book Appointment"  },
  { id: "resources",    label: "Resources"         },
];

const S = {
  fullCenter:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:C.offwhite, fontFamily:"'Inter',-apple-system,sans-serif", padding:"20px", boxSizing:"border-box" },
  app:           { fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", backgroundColor:C.offwhite, minHeight:"100vh", display:"flex", color:C.text },
  sidebar:       { width:"220px", backgroundColor:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, position:"fixed", height:"100vh", overflowY:"auto" },
  main:          { marginLeft:"220px", flex:1, padding:"36px 40px", maxWidth:"860px" },
  logoArea:      { padding:"24px 20px 18px", borderBottom:`1px solid ${C.border}` },
  logoText:      { fontSize:"14px", fontWeight:"800", letterSpacing:"0.08em", color:C.maroon, textTransform:"uppercase" },
  logoSub:       { fontSize:"11px", color:C.muted, marginTop:"2px", letterSpacing:"0.03em" },
  navSection:    { padding:"14px 0", flex:1 },
  navLabel:      { fontSize:"10px", fontWeight:"700", color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 20px", marginBottom:"4px" },
  navItem:       (a) => ({ display:"flex", alignItems:"center", padding:"9px 20px", cursor:"pointer", fontSize:"13px", fontWeight:a?"600":"400", color:a?C.maroon:C.text, backgroundColor:a?`${C.maroon}08`:"transparent", borderLeft:a?`3px solid ${C.periwinkle}`:"3px solid transparent", transition:"all 0.15s ease" }),
  userBar:       { padding:"14px 20px", borderTop:`1px solid ${C.border}` },
  userName:      { fontSize:"13px", fontWeight:"600", color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  userEmail:     { fontSize:"11px", color:C.muted, marginTop:"1px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  pageHeader:    { marginBottom:"28px" },
  pageTitle:     { fontSize:"24px", fontWeight:"800", color:C.text, letterSpacing:"-0.02em" },
  pageSub:       { fontSize:"14px", color:C.muted, marginTop:"4px" },
  card:          { backgroundColor:C.surface, borderRadius:"12px", border:`1px solid ${C.border}`, padding:"22px", marginBottom:"14px" },
  cardTitle:     { fontSize:"14px", fontWeight:"700", marginBottom:"14px", color:C.text },
  grid2:         { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" },
  statCard:      { backgroundColor:C.surface, borderRadius:"10px", padding:"18px", border:`1px solid ${C.border}` },
  statNumber:    { fontSize:"26px", fontWeight:"800", color:C.maroon, letterSpacing:"-0.02em" },
  statLabel:     { fontSize:"12px", color:C.muted, marginTop:"2px", fontWeight:"500" },
  tag:           (v) => ({ display:"inline-block", fontSize:"11px", fontWeight:"600", padding:"3px 8px", borderRadius:"100px", backgroundColor:v==="maroon"?`${C.maroon}15`:`${C.periwinkle}20`, color:v==="maroon"?C.maroon:C.periwinkle, letterSpacing:"0.02em" }),
  checkRow:      (last) => ({ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 0", borderBottom:last?"none":`1px solid ${C.border}`, cursor:"pointer" }),
  checkbox:      (done) => ({ width:"18px", height:"18px", borderRadius:"5px", border:done?"none":`2px solid ${C.border}`, backgroundColor:done?C.periwinkle:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px", transition:"all 0.15s ease" }),
  checkLabel:    (done) => ({ fontSize:"14px", color:done?C.muted:C.text, textDecoration:done?"line-through":"none", lineHeight:"1.4" }),
  checkDesc:     { fontSize:"12px", color:C.muted, marginTop:"2px" },
  vaultRow:      { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:"10px", border:`1px solid ${C.border}`, backgroundColor:C.surface, marginBottom:"8px" },
  apptSlot:      (s) => ({ padding:"9px 13px", borderRadius:"8px", border:`1px solid ${s?C.periwinkle:C.border}`, backgroundColor:s?`${C.periwinkle}15`:C.surface, cursor:"pointer", fontSize:"13px", fontWeight:s?"600":"400", color:s?C.periwinkle:C.text, textAlign:"center", transition:"all 0.15s ease" }),
  input:         { width:"100%", padding:"10px 13px", borderRadius:"8px", border:`1px solid ${C.border}`, fontSize:"14px", color:C.text, backgroundColor:C.surface, outline:"none", boxSizing:"border-box", marginBottom:"10px", fontFamily:"inherit" },
  select:        { width:"100%", padding:"10px 13px", borderRadius:"8px", border:`1px solid ${C.border}`, fontSize:"14px", color:C.text, backgroundColor:C.surface, outline:"none", boxSizing:"border-box", marginBottom:"10px", fontFamily:"inherit" },
  btn:           (v) => ({ padding:v==="sm"?"7px 14px":"10px 18px", borderRadius:"8px", fontSize:v==="sm"?"12px":"13px", fontWeight:"600", cursor:"pointer", backgroundColor:v==="outline"||v==="ghost"?"transparent":v==="google"?C.surface:C.maroon, color:v==="outline"?C.maroon:v==="ghost"?C.muted:v==="google"?C.text:"#fff", border:v==="outline"?`1px solid ${C.maroon}`:v==="google"?`1px solid ${C.border}`:"none", display:"inline-flex", alignItems:"center", gap:"7px", justifyContent:"center", transition:"opacity 0.15s ease", fontFamily:"inherit" }),
  errorText:     { fontSize:"13px", color:C.error, marginBottom:"10px" },
  emptyState:    { textAlign:"center", padding:"40px 20px", color:C.muted },
  progressTrack: { height:"6px", backgroundColor:C.border, borderRadius:"100px", overflow:"hidden" },
  progressBar:   (p) => ({ height:"100%", width:`${p}%`, backgroundColor:C.periwinkle, borderRadius:"100px", transition:"width 0.3s ease" }),
  divider:       { display:"flex", alignItems:"center", gap:"10px", margin:"14px 0" },
  dividerLine:   { flex:1, height:"1px", backgroundColor:C.border },
  dividerText:   { fontSize:"12px", color:C.muted },
  authCard:      { backgroundColor:C.surface, borderRadius:"16px", border:`1px solid ${C.border}`, padding:"36px", width:"100%", maxWidth:"400px", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" },
  authLogo:      { fontSize:"12px", fontWeight:"800", letterSpacing:"0.1em", color:C.maroon, textTransform:"uppercase", marginBottom:"3px" },
  authSub:       { fontSize:"12px", color:C.muted, marginBottom:"24px" },
  authTitle:     { fontSize:"21px", fontWeight:"800", marginBottom:"6px", letterSpacing:"-0.02em" },
  authSwitch:    { fontSize:"13px", color:C.muted, marginTop:"14px", textAlign:"center" },
  authLink:      { color:C.periwinkle, cursor:"pointer", fontWeight:"600" },
};

function GoogleLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AuthScreen({ onLogin, onGuest }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    setError(""); setLoading(true);
    const store = getAuthStore();
    if (mode === "signup") {
      if (!name.trim())        { setError("Please enter your name."); setLoading(false); return; }
      if (store[email])        { setError("An account with this email already exists."); setLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
      const user = { uid: `u_${Date.now()}`, name: name.trim(), email, provider: "email" };
      store[email] = { ...user, password };
      saveAuthStore(store);
      setCurrentUser(user);
      onLogin(user);
    } else {
      const record = store[email];
      if (!record || record.password !== password) { setError("Incorrect email or password."); setLoading(false); return; }
      const user = { uid: record.uid, name: record.name, email: record.email, provider: "email" };
      setCurrentUser(user);
      onLogin(user);
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    const store = getAuthStore();
    const fakeEmail = `google_${Date.now()}@gmail.demo`;
    const user = { uid: `g_${Date.now()}`, name: "Google User", email: fakeEmail, provider: "google" };
    store[fakeEmail] = { ...user, password: null };
    saveAuthStore(store);
    setCurrentUser(user);
    onLogin(user);
  };

  return (
    <div style={S.fullCenter}>
      <div style={S.authCard}>
        <div style={S.authLogo}>CamTrust</div>
        <div style={S.authSub}>Connect Portal</div>
        <div style={S.authTitle}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
        {error && <div style={S.errorText}>{error}</div>}
        {mode === "signup" && <input style={S.input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />}
        <input style={S.input} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <input style={S.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        <button style={{ ...S.btn(), width:"100%", marginBottom:"4px" }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <div style={S.divider}><div style={S.dividerLine}/><span style={S.dividerText}>or</span><div style={S.dividerLine}/></div>
        <button style={{ ...S.btn("google"), width:"100%", marginBottom:"10px" }} onClick={handleGoogle}>
          <GoogleLogo /> Continue with Google
        </button>
        <button style={{ ...S.btn("ghost"), width:"100%", fontSize:"13px", color:C.muted, textDecoration:"underline" }} onClick={onGuest}>
          Browse without an account
        </button>
        <div style={S.authSwitch}>
          {mode === "login"
            ? <>Don't have an account? <span style={S.authLink} onClick={() => { setMode("signup"); setError(""); }}>Sign up</span></>
            : <>Already have an account? <span style={S.authLink} onClick={() => { setMode("login"); setError(""); }}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}

function EntityTypesPage() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Business Entity Types</div>
        <div style={S.pageSub}>Not sure which structure is right for you? Start here.</div>
      </div>
      {ENTITIES.map(e => (
        <div key={e.id} style={{ ...S.card, padding:0, overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }} onClick={() => setOpen(open === e.id ? null : e.id)}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"15px", fontWeight:"700", color:C.text }}>{e.name}</div>
              <div style={{ fontSize:"13px", color:C.muted, marginTop:"3px" }}>{e.tagline}</div>
            </div>
            <div style={{ fontSize:"18px", color:C.muted, marginLeft:"12px", flexShrink:0, transform:open===e.id?"rotate(180deg)":"none", transition:"transform 0.2s ease" }}>v</div>
          </div>
          {open === e.id && (
            <div style={{ borderTop:`1px solid ${C.border}`, padding:"20px 22px" }}>
              <div style={{ marginBottom:"18px" }}>
                <div style={{ fontSize:"11px", fontWeight:"700", color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>Best for</div>
                <div style={{ fontSize:"14px", color:C.text, lineHeight:"1.6" }}>{e.best}</div>
              </div>
              <div style={S.grid2}>
                <div style={{ backgroundColor:`${C.success}08`, borderRadius:"10px", padding:"16px", border:`1px solid ${C.success}20` }}>
                  <div style={{ fontSize:"11px", fontWeight:"700", color:C.success, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>Pros</div>
                  {e.pros.map((p,i) => <div key={i} style={{ fontSize:"13px", color:C.text, marginBottom:"6px", display:"flex", gap:"8px" }}><span style={{ color:C.success, flexShrink:0 }}>+</span>{p}</div>)}
                </div>
                <div style={{ backgroundColor:`${C.error}06`, borderRadius:"10px", padding:"16px", border:`1px solid ${C.error}15` }}>
                  <div style={{ fontSize:"11px", fontWeight:"700", color:C.error, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>Cons</div>
                  {e.cons.map((c,i) => <div key={i} style={{ fontSize:"13px", color:C.text, marginBottom:"6px", display:"flex", gap:"8px" }}><span style={{ color:C.error, flexShrink:0 }}>-</span>{c}</div>)}
                </div>
              </div>
              <div style={{ backgroundColor:`${C.periwinkle}10`, borderRadius:"10px", padding:"14px 16px", marginBottom:"16px", border:`1px solid ${C.periwinkle}25` }}>
                <div style={{ fontSize:"11px", fontWeight:"700", color:C.periwinkle, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>How you're taxed</div>
                <div style={{ fontSize:"13px", color:C.text, lineHeight:"1.6" }}>{e.tax}</div>
              </div>
              <div>
                <div style={{ fontSize:"11px", fontWeight:"700", color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>How to get started</div>
                {e.steps.map((step,i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"8px", alignItems:"flex-start" }}>
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", backgroundColor:`${C.maroon}15`, color:C.maroon, fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px" }}>{i+1}</div>
                    <div style={{ fontSize:"13px", color:C.text, lineHeight:"1.5" }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ ...S.card, backgroundColor:`${C.maroon}06`, border:`1px solid ${C.maroon}20` }}>
        <div style={{ fontSize:"13px", color:C.text, lineHeight:"1.7" }}>
          <strong>Not sure which one is right for you?</strong> Most solo service providers start with an LLC for the liability protection. If you're making significant profit and want to cut your tax bill, an S-Corp election on top of your LLC is usually the next move. Book a consultation and we'll walk through it together.
        </div>
      </div>
    </div>
  );
}

function ResourcesPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(RESOURCES.map(r => r.category)))];
  const visible = filter === "All" ? RESOURCES : RESOURCES.filter(r => r.category === filter);
  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Resource Directory</div>
        <div style={S.pageSub}>Curated tools and links for entrepreneurs at every stage.</div>
      </div>
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
        {categories.map(cat => (
          <button key={cat} style={{ ...S.btn("sm"), backgroundColor:filter===cat?C.maroon:"transparent", color:filter===cat?"#fff":C.muted, border:`1px solid ${filter===cat?C.maroon:C.border}` }} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>
      <div style={S.card}>
        {visible.map((r,i) => (
          <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px", padding:"14px 0", borderBottom:i===visible.length-1?"none":`1px solid ${C.border}`, textDecoration:"none" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"14px", fontWeight:"600", color:C.text }}>{r.title}</div>
              <div style={{ fontSize:"12px", color:C.muted, marginTop:"3px", lineHeight:"1.5" }}>{r.desc}</div>
            </div>
            <span style={{ ...S.tag("blue"), flexShrink:0, marginTop:"2px" }}>{r.category}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CamTrustConnect() {
  const [user, setUser]                 = useState(null);
  const [isGuest, setIsGuest]           = useState(false);
  const [authLoading, setAuthLoading]   = useState(true);
  const [activePage, setActivePage]     = useState("home");
  const [checked, setChecked]           = useState({});
  const [vaultFiles, setVaultFiles]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [saveMsg, setSaveMsg]           = useState("");
  const [selDate, setSelDate]           = useState(null);
  const [selTime, setSelTime]           = useState(null);
  const [selService, setSelService]     = useState("");
  const [clientName, setClientName]     = useState("");
  const [clientEmail, setClientEmail]   = useState("");
  const [booked, setBooked]             = useState(false);
  const [uploadName, setUploadName]     = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (u) loadUserData(u);
    else setAuthLoading(false);
  }, []);

  const loadUserData = (u) => {
    setUser(u); setIsGuest(false);
    setChecked(dbGet(u.uid, "checklist") || {});
    setVaultFiles(dbGet(u.uid, "vault") || [
      { name: "LLC Operating Agreement Template.pdf", size: "248 KB", date: "Jun 5, 2026", tag: "Legal" },
      { name: "EIN Application Guide.pdf",            size: "120 KB", date: "Jun 1, 2026", tag: "Tax"   },
    ]);
    setAppointments(dbGet(u.uid, "appointments") || []);
    setAuthLoading(false);
  };

  const flashSave = (msg = "Saved") => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 2000); };

  const toggleCheck = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next); dbSet(user.uid, "checklist", next); flashSave("Progress saved");
  };

  const addVaultFile = () => {
    if (!uploadName.trim()) return;
    const next = [...vaultFiles, { name: uploadName.trim(), size: "—", date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }), tag: "General" }];
    setVaultFiles(next); dbSet(user.uid, "vault", next); setUploadName(""); flashSave("Document added");
  };

  const removeVaultFile = (idx) => {
    const next = vaultFiles.filter((_,i) => i !== idx);
    setVaultFiles(next); dbSet(user.uid, "vault", next); flashSave("Document removed");
  };

  const handleBook = () => {
    if (!clientName || !clientEmail || !selDate || !selTime || !selService) return;
    const appt = { id: Date.now(), name: clientName, email: clientEmail, service: selService, date: selDate, time: selTime };
    const next = [...appointments, appt];
    setAppointments(next); dbSet(user.uid, "appointments", next); setBooked(true);
  };

  const resetBooking = () => { setBooked(false); setClientName(""); setClientEmail(""); setSelDate(null); setSelTime(null); setSelService(""); };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null); setIsGuest(false); setChecked({}); setVaultFiles([]); setAppointments([]);
    setActivePage("home");
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((completedCount / CHECKLIST.length) * 100);
  const navItems = (user && !isGuest) ? NAV_AUTH : NAV_GUEST;
  const authOnlyPages = ["checklist", "vault", "appointments"];
  const pageToShow = (isGuest && authOnlyPages.includes(activePage)) ? "locked" : activePage;

  if (authLoading) return <div style={S.fullCenter}><div style={{ color:C.muted, fontSize:"14px" }}>Loading...</div></div>;
  if (!user && !isGuest) return <AuthScreen onLogin={loadUserData} onGuest={() => { setIsGuest(true); setActivePage("home"); setAuthLoading(false); }} />;

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.logoArea}>
          <div style={S.logoText}>CamTrust</div>
          <div style={S.logoSub}>Connect Portal</div>
        </div>
        <div style={S.navSection}>
          <div style={S.navLabel}>Menu</div>
          {navItems.map(item => (
            <div key={item.id} style={S.navItem(activePage === item.id)} onClick={() => setActivePage(item.id)}>{item.label}</div>
          ))}
        </div>
        <div style={S.userBar}>
          {user ? (
            <>
              <div style={S.userName}>{user.name}</div>
              <div style={S.userEmail}>{user.email}</div>
              <button style={{ ...S.btn("ghost"), marginTop:"10px", padding:"5px 0", fontSize:"12px", color:C.muted }} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <div style={{ fontSize:"12px", color:C.muted, marginBottom:"8px" }}>Browsing as guest</div>
              <button style={{ ...S.btn("outline"), fontSize:"12px", padding:"7px 12px" }} onClick={() => { setIsGuest(false); setActivePage("home"); }}>Sign in</button>
            </>
          )}
        </div>
      </div>

      <div style={S.main}>
        {saveMsg && <div style={{ position:"fixed", top:"16px", right:"24px", backgroundColor:C.surface, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"8px 14px", fontSize:"13px", color:C.success, zIndex:100 }}>+ {saveMsg}</div>}

        {pageToShow === "locked" && (
          <div>
            <div style={S.pageHeader}>
              <div style={S.pageTitle}>Create a free account</div>
              <div style={S.pageSub}>Sign up to save your checklist progress, manage documents, and book appointments.</div>
            </div>
            <div style={{ ...S.card, textAlign:"center", padding:"48px 24px" }}>
              <div style={{ fontSize:"15px", fontWeight:"600", marginBottom:"8px" }}>This feature requires an account</div>
              <div style={{ fontSize:"14px", color:C.muted, marginBottom:"24px", lineHeight:"1.6" }}>It's free and takes less than a minute.</div>
              <button style={S.btn()} onClick={() => { setIsGuest(false); setActivePage("home"); }}>Create a free account</button>
            </div>
          </div>
        )}

        {pageToShow === "home" && (
          <div>
            <div style={S.pageHeader}>
              <div style={S.pageTitle}>{user ? `Hey, ${user.name.split(" ")[0]}` : "Welcome to CamTrust Connect"}</div>
              <div style={S.pageSub}>{user ? "Here's where your business journey stands." : "Your small business resource hub."}</div>
            </div>
            {user && (
              <>
                <div style={S.grid2}>
                  <div style={S.statCard}><div style={S.statNumber}>{completedCount}/{CHECKLIST.length}</div><div style={S.statLabel}>Checklist steps done</div></div>
                  <div style={S.statCard}><div style={S.statNumber}>{vaultFiles.length}</div><div style={S.statLabel}>Documents stored</div></div>
                </div>
                <div style={{ ...S.card, padding:"18px 22px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                    <span style={{ fontSize:"13px", fontWeight:"600" }}>Startup Progress</span>
                    <span style={{ fontSize:"13px", color:C.periwinkle, fontWeight:"700" }}>{pct}%</span>
                  </div>
                  <div style={S.progressTrack}><div style={S.progressBar(pct)} /></div>
                </div>
              </>
            )}
            {!user && (
              <div style={{ ...S.card, backgroundColor:`${C.maroon}06`, border:`1px solid ${C.maroon}20`, marginBottom:"14px" }}>
                <div style={{ fontSize:"14px", color:C.text, lineHeight:"1.7" }}>CamTrust Consulting Group supports entrepreneurs, notary clients, and small business owners with the tools and guidance to move with confidence.</div>
                <button style={{ ...S.btn(), marginTop:"14px" }} onClick={() => { setIsGuest(false); setActivePage("home"); }}>Create a free account</button>
              </div>
            )}
            <div style={S.card}>
              <div style={S.cardTitle}>Explore</div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {navItems.filter(n => n.id !== "home").map(item => (
                  <button key={item.id} style={S.btn("outline")} onClick={() => setActivePage(item.id)}>{item.label}</button>
                ))}
                {isGuest && ["Startup Checklist","Document Vault","Book Appointment"].map(label => (
                  <button key={label} style={S.btn("outline")} onClick={() => setActivePage(label.toLowerCase().replace(/ /g,"").replace("startup","checklist").replace("document","vault").replace("book","appointments"))}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {pageToShow === "checklist" && (
          <div>
            <div style={S.pageHeader}>
              <div style={S.pageTitle}>Business Startup Checklist</div>
              <div style={S.pageSub}>{completedCount} of {CHECKLIST.length} steps complete — saves automatically.</div>
            </div>
            <div style={{ ...S.card, padding:"18px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                <span style={{ fontSize:"13px", fontWeight:"600" }}>Progress</span>
                <span style={{ fontSize:"13px", color:C.periwinkle, fontWeight:"700" }}>{pct}%</span>
              </div>
              <div style={S.progressTrack}><div style={S.progressBar(pct)} /></div>
            </div>
            <div style={S.card}>
              {CHECKLIST.map((item,idx) => (
                <div key={item.id} style={S.checkRow(idx === CHECKLIST.length-1)} onClick={() => toggleCheck(item.id)}>
                  <div style={S.checkbox(checked[item.id])}>
                    {checked[item.id] && <span style={{ color:"#fff", fontSize:"11px", fontWeight:"800" }}>+</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"6px" }}>
                      <span style={S.checkLabel(checked[item.id])}>{item.label}</span>
                      <span style={S.tag(["legal","tax"].includes(item.category)?"maroon":"blue")}>{item.category}</span>
                    </div>
                    <div style={S.checkDesc}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pageToShow === "entities" && <EntityTypesPage />}

        {pageToShow === "vault" && (
          <div>
            <div style={S.pageHeader}>
              <div style={S.pageTitle}>Document Vault</div>
              <div style={S.pageSub}>Your documents are saved to your account.</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Add a Document</div>
              <input style={S.input} placeholder="Document name (e.g. Operating Agreement.pdf)" value={uploadName} onChange={e => setUploadName(e.target.value)} />
              <button style={S.btn()} onClick={addVaultFile}>Add to Vault</button>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Your Documents ({vaultFiles.length})</div>
              {vaultFiles.length === 0
                ? <div style={S.emptyState}><div style={{ fontSize:"14px" }}>No documents yet. Add one above.</div></div>
                : vaultFiles.map((f,i) => (
                  <div key={i} style={S.vaultRow}>
                    <div>
                      <div style={{ fontSize:"14px", fontWeight:"600" }}>{f.name}</div>
                      <div style={{ fontSize:"12px", color:C.muted }}>{f.size} · Added {f.date}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={S.tag("blue")}>{f.tag}</span>
                      <button style={{ ...S.btn("ghost"), fontSize:"12px", padding:"4px 8px", color:C.error }} onClick={() => removeVaultFile(i)}>Remove</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {pageToShow === "appointments" && (
          <div>
            <div style={S.pageHeader}>
              <div style={S.pageTitle}>Book an Appointment</div>
              <div style={S.pageSub}>Schedule time with CamTrust Consulting Group.</div>
            </div>
            {booked ? (
              <div style={{ ...S.card, textAlign:"center", padding:"48px 24px" }}>
                <div style={{ fontSize:"18px", fontWeight:"700", color:C.maroon, marginBottom:"8px" }}>Appointment Requested</div>
                <div style={{ fontSize:"14px", color:C.muted, lineHeight:"1.7" }}>
                  <strong>{clientName}</strong> — {selService}<br />{selDate} at {selTime}<br /><br />
                  Confirmation will be sent to <strong>{clientEmail}</strong>.
                </div>
                <button style={{ ...S.btn(), marginTop:"24px" }} onClick={resetBooking}>Book Another</button>
              </div>
            ) : (
              <>
                <div style={S.card}>
                  <div style={S.cardTitle}>Your Information</div>
                  <input style={S.input} placeholder="Full name" value={clientName} onChange={e => setClientName(e.target.value)} />
                  <input style={S.input} placeholder="Email address" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  <select style={S.select} value={selService} onChange={e => setSelService(e.target.value)}>
                    <option value="">Select a service...</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Select a Date</div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {Object.keys(APPOINTMENTS).map(date => (
                      <div key={date} style={S.apptSlot(selDate===date)} onClick={() => { setSelDate(date); setSelTime(null); }}>{date}</div>
                    ))}
                  </div>
                </div>
                {selDate && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>Available Times — {selDate}</div>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {APPOINTMENTS[selDate].map(t => (
                        <div key={t} style={S.apptSlot(selTime===t)} onClick={() => setSelTime(t)}>{t}</div>
                      ))}
                    </div>
                  </div>
                )}
                {appointments.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>Your Appointments</div>
                    {appointments.map(a => (
                      <div key={a.id} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}`, fontSize:"14px" }}>
                        <strong>{a.service}</strong><span style={{ color:C.muted }}> · {a.date} at {a.time}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button style={{ ...S.btn(), opacity:(clientName&&clientEmail&&selDate&&selTime&&selService)?1:0.4, cursor:(clientName&&clientEmail&&selDate&&selTime&&selService)?"pointer":"not-allowed" }} onClick={handleBook}>
                  Confirm Appointment
                </button>
              </>
            )}
          </div>
        )}

        {pageToShow === "resources" && <ResourcesPage />}
      </div>
    </div>
  );
}
