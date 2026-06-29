"use client";

interface FilterBarProps {
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  category: string;
  setCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  socket: string;
  setSocket: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  useCases: string[];
  setUseCases: (val: string[]) => void;
  gpuModel: string;
  setGpuModel: (val: string) => void;
}

const cpuBrands = ["All", "Intel", "AMD"];
const gpuBrands = ["All", "NVIDIA", "AMD", "Intel"];
const sockets = ["All", "AM5", "AM4", "LGA1851", "LGA1700", "sTR5"];
const resolutions = ["All", "1080p", "1440p", "4K"];

const cpuUseCases = [
  "Gaming",
  "Video Editing/Content Creation",
  "Streaming",
  "3D Rendering",
  "CAD and Engineering",
  "AI/ML",
  "VMs",
  "General Use and Office Work",
  "Workstation",
];

const gpuUseCases = [
  "Esports",
  "AAA/Story Games",
  "3D Rendering",
  "AI/ML",
  "Workstation",
  "CAD & Engineering",
  "Content Creation/Video Editing",
];

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-white text-black font-semibold"
          : "text-[#777] bg-[#111] border border-[#222] hover:text-white hover:border-[#444]"
      }`}
    >
      {label}
    </button>
  );
}

function UseCaseCheckbox({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${
          checked
            ? "bg-white border-white"
            : "border-[#444] group-hover:border-[#777]"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-base transition-colors duration-200 ${
          checked
            ? "text-white"
            : "text-[#777] group-hover:text-[#aaa]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export default function FilterBar({
  maxPrice,
  setMaxPrice,
  category,
  setCategory,
  brand,
  setBrand,
  socket,
  setSocket,
  resolution,
  setResolution,
  useCases,
  setUseCases,
  gpuModel,
  setGpuModel,
}: FilterBarProps) {
  const toggleUseCase = (uc: string) => {
    setUseCases(
      useCases.includes(uc)
        ? useCases.filter((u) => u !== uc)
        : [...useCases, uc]
    );
  };

  const currentBrands = category === "GPU" ? gpuBrands : cpuBrands;
  const currentUseCases =
    category === "GPU" ? gpuUseCases : cpuUseCases;

  const sliderMax = category === "GPU" ? 20000 : 20000;
  const sliderMaxLabel =
    category === "GPU" ? "$20,000" : "$20,000";

  return (
    <div className="w-full flex flex-col gap-8 px-8 py-8 border-b border-[#1a1a1a]">
      {/* Row 1 */}
      <div className="flex flex-wrap gap-10">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
            Category
          </h3>
          <div className="flex gap-2">
            {["CPU", "GPU"].map((cat) => (
              <FilterButton
                key={cat}
                label={cat}
                active={category === cat}
                onClick={() => {
                  setCategory(cat);
                  setBrand("All");
                  setSocket("All");
                  setResolution("All");
                  setUseCases([]);
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
            Brand
          </h3>
          <div className="flex gap-2">
            {currentBrands.map((b) => (
              <FilterButton
                key={b}
                label={b}
                active={brand === b}
                onClick={() => setBrand(b)}
              />
            ))}
          </div>
        </div>

        {category === "CPU" && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
              Socket
            </h3>
            <div className="flex gap-2">
              {sockets.map((s) => (
                <FilterButton
                  key={s}
                  label={s}
                  active={socket === s}
                  onClick={() => setSocket(s)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
            Resolution
          </h3>
          <div className="flex gap-2">
            {resolutions.map((r) => (
              <FilterButton
                key={r}
                label={r}
                active={resolution === r}
                onClick={() => setResolution(r)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-3 max-w-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
            Max Price
          </h3>
          <span className="text-2xl font-bold text-white">
            ${maxPrice.toLocaleString()}
          </span>
        </div>

        <input
          key={category}
          type="range"
          min={0}
          max={sliderMax}
          step={50}
          value={Math.min(maxPrice, sliderMax)}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 accent-white cursor-pointer"
        />

        <div className="flex justify-between text-sm text-[#555]">
          <span>$0</span>
          <span>{sliderMaxLabel}</span>
        </div>
      </div>

      {/* Use Cases */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
          Use Cases
        </h3>
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          {currentUseCases.map((uc) => (
            <UseCaseCheckbox
              key={uc}
              label={uc}
              checked={useCases.includes(uc)}
              onClick={() => toggleUseCase(uc)}
            />
          ))}
        </div>
      </div>

      {/* GPU Input */}
      {category === "CPU" && (
        <div className="flex flex-col gap-3 max-w-sm">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555]">
            Add Your GPU{" "}
            <span className="text-[#444] normal-case tracking-normal font-normal">
              (optional)
            </span>
          </h3>

          <p className="text-sm text-[#444]">
            Enter your GPU for bottleneck detection
          </p>

          <input
            type="text"
            placeholder="e.g. RTX 4070"
            value={gpuModel}
            onChange={(e) => setGpuModel(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-base text-white placeholder-[#444] focus:outline-none focus:border-[#444] transition-colors"
          />
        </div>
      )}
    </div>
  );
}