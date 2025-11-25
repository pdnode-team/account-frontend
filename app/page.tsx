"use client"
import { useEffect } from "react";
export default function Home() {
  useEffect(() => {
    window.location.pathname = "/login"
  }, [])
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-20 flex justify-center items-center rounded-2xl">
        <h1 className="font-bold">Home</h1>
      </div>
    </div>
  );
}
