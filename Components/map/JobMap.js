import React from "react";

export default function JobMap({ jobs = [] }) {
  return (
    <div className="w-full h-64 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500">
      Karte Platzhalter (Jobs: {jobs.length})
    </div>
  );
}
