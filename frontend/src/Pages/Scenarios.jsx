import { useState } from "react";

import ScenarioForm from "../Components/ScenarioForm";
import ScenarioResult from "../Components/ScenarioResult";

function Scenarios() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScenario = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const scenarioInput = {
      scenario: formData.get("scenario"),
      shock: formData.get("shock")
    };

    console.log("Scenario input:", scenarioInput);

    // Backend will be connected here later.
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResult(null);
    }, 500);
  };

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Scenarios & Stress Testing
        </h1>

        <p className="text-slate-500 mt-2">
          Test how your portfolio could respond to different market conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ScenarioForm
          onSubmit={handleScenario}
          loading={loading}
        />

        <ScenarioResult
          result={result}
        />

      </div>

    </main>
  );
}

export default Scenarios;