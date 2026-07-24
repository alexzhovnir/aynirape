import { useEffect, useState } from "react";

interface ProfileDashboardProps {
  countryCode: string;
}

interface OrderHistory {
  id: string;
  created_at: string;
  total: number;
  currency_code: string;
  status: string;
  items: {
    title: string;
    quantity: number;
    thumbnail?: string;
  }[];
}

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  is_approved: boolean;
}

type TabType = "orders" | "favorites" | "reviews";

export const ProfileDashboard = ({ countryCode }: ProfileDashboardProps) => {
  const [user, setUser] = useState<{ email: string; first_name?: string; last_name?: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [favorites, setFavorites] = useState<{ id: string; title: string; handle: string; thumbnail?: string }[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // Initialize
  useEffect(() => {
    const savedUser = localStorage.getItem("ayni_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load favorites from local storage
    const savedFavorites = localStorage.getItem("ayni_favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    setLoading(false);
  }, []);

  // Fetch user specific data
  useEffect(() => {
    if (!user) return;

    const mockOrders: OrderHistory[] = [
      {
        id: "ord_01J35D8YZE",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        total: 8900,
        currency_code: "eur",
        status: "Completed",
        items: [
          {
            title: "Nukini Sansara Rapé",
            quantity: 1,
            thumbnail: "/images/blog/rape/nukini-1504.23abece79ac5bad050fdc8779f1c5b53.webp"
          },
          {
            title: "Kuripe Colibri Teak",
            quantity: 1,
            thumbnail: "/images/blog/kolibri-teak.c6c0e21a20358358ba4cfc9a759bfa19.webp"
          }
        ]
      }
    ];

    const mockFeedbacks: FeedbackItem[] = [
      {
        id: "fb_01",
        rating: 5,
        comment: "Excellent high-quality Amazonian supplies. Strongly recommend the Nukini Sansara blend!",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_approved: true
      }
    ];

    setOrders(mockOrders);
    setFeedbacks(mockFeedbacks);
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const userInfo = { email, first_name: email.split("@")[0] };
    localStorage.setItem("ayni_user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !firstName) {
      setError("Please fill in email, password, and first name.");
      return;
    }

    const userInfo = { email, first_name: firstName, last_name: lastName };
    localStorage.setItem("ayni_user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem("ayni_user");
    setUser(null);
    setOrders([]);
    setFeedbacks([]);
  };

  const handleRemoveFavorite = (prodId: string) => {
    const updated = favorites.filter(fav => fav.id !== prodId);
    setFavorites(updated);
    localStorage.setItem("ayni_favorites", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-20 p-12 bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl shadow-xl text-center flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent-gold)] border-t-transparent animate-spin"></div>
        <p className="text-sm font-serif-heading text-[var(--color-text-primary)] animate-pulse">
          Loading Your Sacred Account Portal...
        </p>
      </div>
    );
  }

  // Not Logged In screen
  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-3xl shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <span className="text-[var(--color-accent-gold)] font-bold tracking-[0.28em] text-[10px] uppercase block mb-2">
            AYNI RAPÉ &bull; MEMBER PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[var(--color-text-primary)] leading-tight">
            {isRegistering ? "Create Account" : "Sign In to Portal"}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed max-w-sm mx-auto">
            Access your ceremonial order history, saved sacred blends, and verified community reviews.
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[var(--color-bg-surface)] p-1.5 rounded-2xl border border-[var(--color-border-subtle)] mb-8">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(""); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              !isRegistering
                ? "bg-[var(--color-accent-gold)] text-stone-950 shadow-md"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(""); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              isRegistering
                ? "bg-[var(--color-accent-gold)] text-stone-950 shadow-md"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Register
          </button>
        </div>
        
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Santos"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">E-mail Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Create Account & Join Ayni</span>
              <span>&rarr;</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">E-mail Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl focus:border-[var(--color-accent-gold)] focus:outline-none text-sm transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to Account</span>
              <span>&rarr;</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  // Logged In screen with Profile Banner & Sidebar Tabs
  return (
    <div className="space-y-10">
      {/* Profile Header Hero Showcase Card */}
      <div className="bg-[var(--color-bg-surface-elevated)] p-8 sm:p-10 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-gold)]/15 flex items-center justify-center text-2xl font-bold font-serif-heading text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/30 shrink-0">
            {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-gold)]">
                VERIFIED PRACTITIONER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[var(--color-text-primary)] mt-1">
              {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.email}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)] rounded-full text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer shrink-0"
        >
          Sign Out
        </button>
      </div>

      {/* Quick Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[var(--color-bg-surface-elevated)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Orders Placed</span>
            <strong className="text-2xl font-serif-heading text-[var(--color-text-primary)]">{orders.length}</strong>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center text-xl border border-[var(--color-accent-gold)]/20">
            📦
          </div>
        </div>

        <div className="bg-[var(--color-bg-surface-elevated)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Saved Favorites</span>
            <strong className="text-2xl font-serif-heading text-[var(--color-text-primary)]">{favorites.length}</strong>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center text-xl border border-[var(--color-accent-gold)]/20">
            ❤️
          </div>
        </div>

        <div className="bg-[var(--color-bg-surface-elevated)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">My Reviews</span>
            <strong className="text-2xl font-serif-heading text-[var(--color-text-primary)]">{feedbacks.length}</strong>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center text-xl border border-[var(--color-accent-gold)]/20">
            ★
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
        {/* Sidebar Navigation */}
        <aside className="bg-[var(--color-bg-surface-elevated)] p-4 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "orders"
                ? "bg-[var(--color-accent-gold)] text-stone-950 shadow-md"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>📦</span>
              <span>Order History</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-stone-950/15">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "favorites"
                ? "bg-[var(--color-accent-gold)] text-stone-950 shadow-md"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>❤️</span>
              <span>My Favorites</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-stone-950/15">{favorites.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[var(--color-accent-gold)] text-stone-950 shadow-md"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>★</span>
              <span>My Reviews</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-stone-950/15">{feedbacks.length}</span>
          </button>
        </aside>

        {/* Active Tab Main Content Area */}
        <main className="w-full">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)]">Order History</h2>
                <span className="text-xs text-[var(--color-text-muted)]">Showing recent purchases</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 bg-[var(--color-bg-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] text-center space-y-4 shadow-sm">
                  <span className="text-4xl">🛍️</span>
                  <p className="text-sm text-[var(--color-text-secondary)]">You haven't placed any ceremonial orders yet.</p>
                  <a
                    href={`/${countryCode}/store`}
                    className="inline-block px-6 py-3 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
                  >
                    Browse Catalogue &rarr;
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 bg-[var(--color-bg-surface-elevated)] shadow-sm space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-[var(--color-border-subtle)] text-xs">
                        <div>
                          <span className="text-[var(--color-text-muted)] font-medium block uppercase tracking-wider text-[10px]">Order ID</span>
                          <span className="font-mono font-bold text-[var(--color-text-primary)] mt-1 block">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] font-medium block uppercase tracking-wider text-[10px]">Date</span>
                          <span className="text-[var(--color-text-secondary)] mt-1 block">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] font-medium block uppercase tracking-wider text-[10px]">Total Amount</span>
                          <span className="font-bold text-[var(--color-accent-gold)] mt-1 block">{(order.total / 100).toFixed(2)} {order.currency_code.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] font-medium block uppercase tracking-wider text-[10px]">Fulfillment</span>
                          <span className="mt-1 inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase">{order.status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-[var(--color-bg-surface)] p-3.5 rounded-2xl border border-[var(--color-border-subtle)]">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} className="w-14 h-14 object-cover rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0" />
                            ) : (
                              <div className="w-14 h-14 bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-xl shrink-0 flex items-center justify-center text-lg">🌿</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{item.title}</h4>
                              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)]">My Saved Favorites</h2>
                <span className="text-xs text-[var(--color-text-muted)]">{favorites.length} Saved</span>
              </div>

              {favorites.length === 0 ? (
                <div className="p-12 bg-[var(--color-bg-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] text-center space-y-4 shadow-sm">
                  <span className="text-4xl">❤️</span>
                  <p className="text-sm text-[var(--color-text-secondary)]">No items saved in your favorites list yet.</p>
                  <a
                    href={`/${countryCode}/store`}
                    className="inline-block px-6 py-3 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
                  >
                    Explore Shop & Save Items &rarr;
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map(fav => (
                    <div key={fav.id} className="flex items-center justify-between p-4 bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm hover:border-[var(--color-accent-gold)] transition-colors">
                      <a href={`/${countryCode}/store/${fav.handle || fav.id}`} className="flex gap-4 items-center group flex-1 min-w-0">
                        {fav.thumbnail ? (
                          <img src={fav.thumbnail} alt={fav.title} className="w-14 h-14 object-cover rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl shrink-0 flex items-center justify-center text-lg">🌿</div>
                        )}
                        <span className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)] transition-colors truncate">
                          {fav.title}
                        </span>
                      </a>
                      
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="text-[var(--color-text-muted)] hover:text-red-500 p-2.5 rounded-xl hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer shrink-0 ml-2 border border-transparent hover:border-[var(--color-border-subtle)]"
                        aria-label="Remove from favorites"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)]">My Submitted Reviews</h2>
                <span className="text-xs text-[var(--color-text-muted)]">{feedbacks.length} Feedback Submitted</span>
              </div>

              {feedbacks.length === 0 ? (
                <div className="p-12 bg-[var(--color-bg-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] text-center space-y-4 shadow-sm">
                  <span className="text-4xl">★</span>
                  <p className="text-sm text-[var(--color-text-secondary)]">You haven't left any community reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map(fb => (
                    <div key={fb.id} className="border border-[var(--color-border-subtle)] rounded-3xl p-6 bg-[var(--color-bg-surface-elevated)] shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex text-[var(--color-accent-gold)] text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed italic">"{fb.comment}"</p>
                      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          fb.is_approved ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {fb.is_approved ? "✓ Published" : "⟳ Under Moderation"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
