"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState("CPU");
  const [brand, setBrand] = useState("All");
  const [socket, setSocket] = useState("All");
  const [resolution, setResolution] = useState("All");
  const [refreshRate, setRefreshRate] = useState<number | null>(null);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [gpuModel, setGpuModel] = useState("");

  // Separate price memory for CPUs and GPUs
  const [cpuMaxPrice, setCpuMaxPrice] = useState(20000);
  const [gpuMaxPrice, setGpuMaxPrice] = useState(20000);

  const maxPrice = category === "CPU" ? cpuMaxPrice : gpuMaxPrice;

  const setMaxPrice = (value: number) => {
    if (category === "CPU") {
      setCpuMaxPrice(value);
    } else {
      setGpuMaxPrice(value);
    }
  };

  // Debounce + cache refs
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const cache = useRef<Record<string, number[]>>({});

  // Reset category-specific filters when category changes
  // Resolution & Target Hz are preserved
  useEffect(() => {
    setUseCases([]);
    setBrand("All");
    setSocket("All");
    setGpuModel("");
  }, [category]);

  // Fetch and rank products
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);

      /*
       * CATEGORY-SPECIFIC TABLE
       *
       * CPU → cpus
       * GPU → gpus
       */
      const tableName = category === "CPU" ? "cpus" : "gpus";

      let query = supabase
        .from(tableName)
        .select("*")
        .lte("price", maxPrice);

      /*
       * BRAND FILTER
       */
      if (brand !== "All") {
        query = query.eq("brand", brand);
      }

      /*
       * SOCKET FILTER
       *
       * Socket only exists in the CPU table.
       */
      if (category === "CPU" && socket !== "All") {
        query = query.eq("socket", socket);
      }

      /*
       * FETCH PRODUCTS
       */
      const { data, error } = await query
        .order("price", { ascending: true })
        .limit(1500);

      console.log("CATEGORY:", category);
      console.log("TABLE:", tableName);
      console.log("GPU/CPU DATA:", data);
      console.log("SUPABASE ERROR:", error);  

      if (error) {
        console.error("SUPABASE ERROR:", error);
        setProducts([]);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error("SUPABASE RETURNED NO DATA");
        setProducts([]);
        setLoading(false);
        return;
      }

      console.log(
        `Loaded ${data.length} ${category} products from ${tableName}`
      );

      /*
       * If no smart filters are active,
       * render all results sorted by price directly.
       */
      const hasFilters =
        resolution !== "All" ||
        refreshRate !== null ||
        useCases.length > 0 ||
        gpuModel.trim() !== "";

      if (!hasFilters) {
        setProducts(data);
        setLoading(false);
        return;
      }

      /*
       * CACHE KEY
       *
       * Category is included so CPU and GPU
       * recommendations remain separate.
       */
      const cacheKey = JSON.stringify({
        category,
        maxPrice,
        brand,
        socket,
        resolution,
        refreshRate,
        useCases,
        gpuModel,
      });

      if (cache.current[cacheKey]) {
        const rankedIds = cache.current[cacheKey];

        const ranked = rankedIds
          .map((id: number) => data.find((p) => p.id === id))
          .filter(Boolean);

        const unranked = data.filter(
          (p) => !rankedIds.includes(p.id)
        );

        setProducts([...ranked, ...unranked]);
        setLoading(false);
        return;
      }

      /*
       * SEND PRODUCTS TO AI RANKER
       *
       * Limit to top 150 products to keep Groq fast
       * and avoid unnecessary token usage.
       */
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products: data.slice(0, 150),
            filters: {
              category,
              maxPrice,
              brand,
              socket,
              resolution,
              refreshRate,
              useCases,
              gpuModel,
            },
          }),
        });

        if (!res.ok) {
          console.error(
            "RECOMMENDATION API FAILED:",
            res.status
          );

          setProducts(data);
          setLoading(false);
          return;
        }

        const { rankedIds } = await res.json();

        if (Array.isArray(rankedIds) && rankedIds.length > 0) {
          cache.current[cacheKey] = rankedIds;

          const ranked = rankedIds
            .map((id: number) =>
              data.find((p) => p.id === id)
            )
            .filter(Boolean);

          const unranked = data.filter(
            (p) => !rankedIds.includes(p.id)
          );

          setProducts([...ranked, ...unranked]);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "RECOMMENDATION REQUEST ERROR:",
          error
        );

        // If AI ranking fails, still show the products.
        setProducts(data);
      }

      setLoading(false);
    }, 800);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    maxPrice,
    category,
    brand,
    socket,
    resolution,
    refreshRate,
    useCases,
    gpuModel,
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-8 py-5 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white"></div>

          <span className="font-bold text-lg tracking-tight">
            PC Pilot
          </span>
        </div>

        <span className="text-xs text-[#444] tracking-widest uppercase">
          Find Your Build
        </span>
      </header>

      {/* Hero */}
      <div className="px-8 pt-8 pb-6 border-b border-[#1a1a1a]">
        <h1 className="text-5xl font-bold tracking-tight leading-none mb-2">
          Stop guessing, <br />
          find the right hardware.
        </h1>

        <p className="text-[#555] text-base">
          Personalized recommendations tailored to how you actually use your
          PC.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        socket={socket}
        setSocket={setSocket}
        resolution={resolution}
        setResolution={setResolution}
        refreshRate={refreshRate}
        setRefreshRate={setRefreshRate}
        useCases={useCases}
        setUseCases={setUseCases}
        gpuModel={gpuModel}
        setGpuModel={setGpuModel}
      />

      {/* Products */}
      <main className="px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#1a1a1a] rounded-xl h-72 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 text-[#444]">
            <p className="text-4xl mb-3">◻</p>

            <p className="text-sm">
              No parts found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#444] mb-5 tracking-widest uppercase">
              {products.length} results
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p, index) => (
                <ProductCard
                  key={`${p.id}-${index}`}
                  product={p}
                  category={category}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}