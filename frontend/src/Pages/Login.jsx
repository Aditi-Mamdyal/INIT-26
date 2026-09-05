import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    // 1. Login
    const {
      data: { user },
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      throw loginError;
    }

    if (!user) {
      throw new Error("Unable to login.");
    }

    console.log("Logged in user:", user.id);

    // 2. Save company name and username to profiles
const companyName = user.user_metadata?.company_name;
const username = user.user_metadata?.username;

if (companyName && username) {
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      company_name: companyName,
      username: username,
    });

  if (profileError) {
    throw profileError;
  }

  console.log("Profile saved successfully!");
}

    // 2. Check if portfolio already exists
    const {
      data: existingPortfolio,
      error: portfolioCheckError,
    } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (portfolioCheckError) {
      throw portfolioCheckError;
    }

    // If portfolio already exists, don't create another one
    if (!existingPortfolio) {

      // 3. Create portfolio
      const {
        data: portfolio,
        error: portfolioError,
      } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name: "My Portfolio",
          risk_profile: "balanced",
          cash_buffer_pct: 0.10,
          capital: 1000000,
        })
        .select()
        .single();

      if (portfolioError) {
        throw portfolioError;
      }

      // 4. Get assets
      const {
        data: assets,
        error: assetsError,
      } = await supabase
        .from("assets")
        .select("id, asset_class");

      if (assetsError) {
        throw assetsError;
      }

      // 5. Default allocation
      const allocation = {
        Equity: 0.2208,
        Gold: 0.3896,
        Bonds: 0.3247,
        Cash: 0.0649,
      };

      const holdings = assets
        .filter(
          (asset) =>
            allocation[asset.asset_class] !== undefined
        )
        .map((asset) => ({
          portfolio_id: portfolio.id,
          asset_id: asset.id,
          weight: allocation[asset.asset_class],
          is_current: true,
        }));

      if (holdings.length === 0) {
        throw new Error("No matching assets found.");
      }

      // 6. Insert holdings
      const { error: holdingsError } =
        await supabase
          .from("portfolio_holdings")
          .insert(holdings);

      if (holdingsError) {
        throw holdingsError;
      }

      // 7. Create risk rules
      const riskRules = [
        {
          portfolio_id: portfolio.id,
          metric: "max_equity",
          threshold_value: 60,
        },
        {
          portfolio_id: portfolio.id,
          metric: "max_gold",
          threshold_value: 20,
        },
        {
          portfolio_id: portfolio.id,
          metric: "max_single_asset",
          threshold_value: 25,
        },
        {
          portfolio_id: portfolio.id,
          metric: "min_liquidity",
          threshold_value: 15,
        },
        {
          portfolio_id: portfolio.id,
          metric: "max_volatility",
          threshold_value: 15,
        },
      ];

      const { error: riskError } =
        await supabase
          .from("risk_rules")
          .insert(riskRules);

      if (riskError) {
        throw riskError;
      }

      // 8. Create initial snapshot
      const { error: snapshotError } =
        await supabase
          .from("portfolio_snapshots")
          .insert({
            portfolio_id: portfolio.id,
            value: 1000000,
          });

      if (snapshotError) {
        throw snapshotError;
      }

      console.log("Portfolio created successfully!");
    } else {
      console.log("Portfolio already exists.");
    }

    // 9. Go to dashboard
    navigate("/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Unable to login.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-slate-800">Fin</span>
            <span className="text-blue-600">Tech</span>
          </h1>

          <p className="text-slate-500 mt-2">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;