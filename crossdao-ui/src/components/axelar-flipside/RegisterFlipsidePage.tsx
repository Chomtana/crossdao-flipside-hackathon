import React from "react";
import RegisterFirstDomain from "../RegisterFirstDomain";

export default function RegisterFlipsidePage() {
  return (
    <div className="min-h-screen bg-red-900 text-white selection:bg-indigo-500 selection:text-white">
      <div className="flex justify-center p-8">
        <h1 className="mb-4 text-5xl font-bold xl:text-6xl">CrossDAO</h1>
      </div>

      <div className="flex justify-center">
        <div style={{ maxWidth: 600 }}>
          <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 xl:text-4xl">
            Register Domain
          </h3>

          <RegisterFirstDomain />
        </div>
      </div>
    </div>
  );
}
