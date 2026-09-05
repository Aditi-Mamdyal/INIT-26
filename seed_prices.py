import random
from datetime import datetime, timedelta
from db import supabase

BASE_PRICES = {"Equity": 100, "Bonds": 100, "Gold": 100, "Cash": 100}

def run():
    assets = supabase.table("assets").select("*").execute().data
    start_time = datetime.utcnow() - timedelta(days=30)

    prices = {a["asset_class"]: BASE_PRICES.get(a["asset_class"], 100) for a in assets}

    for day in range(30):
        timestamp = (start_time + timedelta(days=day)).isoformat()
        for a in assets:
            prices[a["asset_class"]] *= (1 + random.uniform(-0.015, 0.015))
            supabase.table("market_prices").insert({
                "asset_id": a["id"],
                "price": round(prices[a["asset_class"]], 2),
                "source": "simulated",
                "recorded_at": timestamp   # explicit, shared across all 4 assets this day
            }).execute()

    print("Seeded 30 aligned days of prices for", len(assets), "assets")

if __name__ == "__main__":
    run()