import os
import random
import requests
from datetime import datetime
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from db import supabase

load_dotenv()
API_KEY = os.getenv("TWELVE_DATA_API_KEY")


def fetch_live_price(symbol):
    """Try the real market API. Return None if it fails for any reason."""
    try:
        url = f"https://api.twelvedata.com/price?symbol={symbol}&apikey={API_KEY}"
        r = requests.get(url, timeout=5)
        data = r.json()
        if "price" in data:
            return float(data["price"])
        return None
    except Exception as e:
        print(f"Live price fetch failed for {symbol}: {e}")
        return None


def get_next_price(asset, last_price):
    """Real price if available, otherwise a small simulated nudge from last known price."""
    if asset["asset_class"] == "Cash":
        # Cash has no market price — treat as stable, tiny simulated drift only
        return round(last_price * (1 + random.uniform(-0.0001, 0.0002)), 4), "simulated"

    live_price = fetch_live_price(asset["symbol"])
    if live_price is not None:
        return live_price, "live"

    # Fallback: simulate a small random move from the last price
    simulated = last_price * (1 + random.uniform(-0.01, 0.01))
    return round(simulated, 2), "simulated"


def tick():
    print(f"[{datetime.utcnow().isoformat()}] Running price tick...")
    timestamp = datetime.utcnow().isoformat()

    assets = supabase.table("assets").select("*").execute().data

    for asset in assets:
        last_row = supabase.table("market_prices") \
            .select("price").eq("asset_id", asset["id"]) \
            .order("recorded_at", desc=True).limit(1).execute().data
        last_price = last_row[0]["price"] if last_row else 100

        new_price, source = get_next_price(asset, last_price)

        supabase.table("market_prices").insert({
            "asset_id": asset["id"],
            "price": new_price,
            "source": source,
            "recorded_at": timestamp
        }).execute()

        print(f"  {asset['asset_class']}: {new_price} ({source})")

    # Update portfolio value snapshots for every portfolio
    portfolios = supabase.table("portfolios").select("*").execute().data
    asset_price_map = {a["id"]: a for a in assets}

    for p in portfolios:
        holdings = supabase.table("portfolio_holdings") \
            .select("*").eq("portfolio_id", p["id"]).eq("is_current", True).execute().data

        total_value = sum(h["weight"] for h in holdings) * p["capital"]

        supabase.table("portfolio_snapshots").insert({
            "portfolio_id": p["id"],
            "value": round(total_value, 2),
            "created_at": timestamp
        }).execute()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(tick, "interval", seconds=30)
    scheduler.start()
    print("Price feed scheduler started — ticking every 30 seconds.")