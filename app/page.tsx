"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();


  return (
    <div className="relative min-h-screen text-white">
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center space-y-10">
        <h1 className="text-4xl sm:text-5xl font-bold  bg-clip-text text-white  drop-shadow-lg">
          Data Management Systems
        </h1>

        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Streamline operations with powerful, role-based data platforms. Choose
          a system to explore and manage your organization efficiently.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mt-6">
          {/* School System */}
          <button
            onClick={() => router.push("/school")}
            className="border-2 p-6 rounded-xl shadow-lg hover:scale-105 transform transition-all hover:shadow-2xl"
          >
            <h2 className="text-xl font-semibold mb-2">School System</h2>
            <p className="text-sm text-gray-100">
              Manage students, teachers, courses, grades, and reports.
            </p>
          </button>

          {/* Institution System */}
          <button
            onClick={() => router.push("/institution")}
            className="border-2 p-6 rounded-xl shadow-lg hover:scale-105 transform transition-all hover:shadow-2xl"
          >
            <h2 className="text-xl font-semibold mb-2">Institution System</h2>
            <p className="text-sm text-gray-100">
              Ideal for hospitals, clinics, or small businesses to track clients,
              services, staff, and billing.
            </p>
          </button>

          {/* Inventory System */}
          <button
            onClick={() => router.push("/inventory")}
            className=" p-6  border-2 rounded-xl shadow-lg hover:scale-105 transform transition-all hover:shadow-2xl"
          >
            <h2 className="text-xl font-semibold mb-2">Inventory System</h2>
            <p className="text-sm text-gray-100">
              Monitor stock levels, suppliers, sales, and restocking across locations.
            </p>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-sm text-gray-400 mt-10">
        &copy; {new Date().getFullYear()} KUCHIKI Systems. All rights reserved.
      </footer>
    </div>
  );
}
