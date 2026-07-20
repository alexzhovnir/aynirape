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
    return <div className="text-center py-20 text-stone-600">Loading profile...</div>;
  }

  // Not Logged In screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]">
        <h2 className="text-3xl font-serif italic text-stone-900 mb-6 text-center">
          {isRegistering ? "Create Account" : "Sign In"}
        </h2>
        
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-[#bdcd00] hover:bg-[#a6b400] text-stone-950 font-bold rounded-full transition-colors shadow-sm cursor-pointer mt-4"
            >
              Sign Up
            </button>
            <p className="text-sm text-stone-500 text-center mt-4">
              Already have an account?{" "}
              <button type="button" onClick={() => setIsRegistering(false)} className="text-[#bdcd00] hover:underline font-medium">
                Log In
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-0 bg-stone-50/60 shadow-sm rounded-xl focus:shadow-md focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-[#bdcd00] hover:bg-[#a6b400] text-stone-950 font-bold rounded-full transition-colors shadow-sm cursor-pointer mt-4"
            >
              Sign In
            </button>
            <p className="text-sm text-stone-500 text-center mt-4">
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsRegistering(true)} className="text-[#bdcd00] hover:underline font-medium">
                Register
              </button>
            </p>
          </form>
        )}
      </div>
    );
  }

  // Logged In screen with Left Sidebar Menu and cleaned up borders
  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      {/* Header section (Borderless, minimal structure) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 mb-8 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Welcome back</span>
          <h1 className="text-3xl font-bold text-stone-950 mt-1">
            {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.email}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">
        {/* Left Sidebar Menu */}
        <aside className="flex flex-col gap-1.5" aria-label="Profile navigation sidebar">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#9db0ba] text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Order History</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "favorites"
                ? "bg-[#9db0ba] text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <span>My Favorites</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#9db0ba] text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l3.62-3.134c1.154-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span>My Reviews</span>
          </button>
        </aside>

        {/* Tab Contents - borderless details */}
        <main className="w-full">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-stone-900 pb-4 border-b border-stone-100">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-stone-500 text-sm">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="border border-stone-100 rounded-2xl p-6 bg-white shadow-sm">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 mb-4 border-b border-stone-100 text-xs">
                        <div>
                          <span className="text-stone-400 font-medium block uppercase tracking-wider">Order ID</span>
                          <span className="font-semibold text-stone-900 mt-1 block">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block uppercase tracking-wider">Date</span>
                          <span className="text-stone-700 mt-1 block">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block uppercase tracking-wider">Total</span>
                          <span className="font-bold text-stone-950 mt-1 block">{(order.total / 100).toFixed(2)} {order.currency_code.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block uppercase tracking-wider">Status</span>
                          <span className="mt-1 inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">{order.status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-stone-100" />
                            ) : (
                              <div className="w-12 h-12 bg-stone-50 border border-stone-100 rounded-xl" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-stone-900 truncate">{item.title}</h4>
                              <p className="text-xs text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
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
            <div>
              <h2 className="text-xl font-bold text-stone-900 pb-4 border-b border-stone-100 mb-6">My Favorites</h2>
              {favorites.length === 0 ? (
                <p className="text-stone-500 text-sm">No items in your favorites list yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map(fav => (
                    <div key={fav.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                      <a href={`/${countryCode}/store/${fav.id}`} className="flex gap-4 items-center group flex-1 min-w-0">
                        {fav.thumbnail ? (
                          <img src={fav.thumbnail} alt={fav.title} className="w-14 h-14 object-cover rounded-xl border border-stone-100 shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-stone-50 border border-stone-100 rounded-xl shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-stone-900 group-hover:text-[#9db0ba] transition-colors truncate">
                          {fav.title}
                        </span>
                      </a>
                      
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="text-stone-400 hover:text-red-500 p-2 rounded-full hover:bg-stone-50 transition-colors cursor-pointer shrink-0 ml-2"
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
              <h2 className="text-xl font-bold text-stone-900 pb-4 border-b border-stone-100">My Reviews</h2>
              {feedbacks.length === 0 ? (
                <p className="text-stone-500 text-sm">You haven't left any feedback yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map(fb => (
                    <div key={fb.id} className="border border-stone-100 rounded-2xl p-6 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex text-amber-400 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span className="text-xs text-stone-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed mb-4">"{fb.comment}"</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        fb.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-900'
                      }`}>
                        {fb.is_approved ? "✓ Published" : "⟳ Under Moderation"}
                      </span>
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
