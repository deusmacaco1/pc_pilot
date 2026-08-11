interface Product {
id: number;
name: string;
price: number;
image_url: string;
product_url: string;
retailer: string;
brand?: string;

cpu_cores_threads?: string;
cpu_boost_clock?: string;
cpu_tdp?: string;
cpu_benchmark_cinebench_r23_multi?: number | string;
}

interface ProductCardProps {
product: Product;
category: string;
}

export default function ProductCard({
product,
category,
}: ProductCardProps) {
return ( <div className="group bg-[#111111] border border-[#222222] rounded-xl overflow-hidden hover:border-[#444444] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col">

  {/* Product Image */}
  <div className="relative bg-[#0d0d0d] h-48 flex items-center justify-center p-4">
    {product.image_url ? (
      <img
        src={product.image_url}
        alt={product.name}
        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
      />
    ) : (
      <div className="text-[#333] text-sm">
        No Image
      </div>
    )}

    <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-widest uppercase text-[#555] bg-[#0a0a0a] px-2 py-1 rounded-md border border-[#222]">
      {category}
    </span>
  </div>

  {/* Product Info */}
  <div className="p-4 flex flex-col gap-4 flex-1">

    {/* Product Name */}
    <p className="text-sm text-[#aaa] leading-snug line-clamp-2 font-medium">
      {product.name}
    </p>

    {/* CPU Specifications */}
    {category === "CPU" && (
      <div className="border-t border-[#222] pt-3 flex flex-col gap-2">

        <div className="flex justify-between gap-4">
          <span className="text-xs text-[#666]">
            Cores/Threads:
          </span>
          <span className="text-xs text-[#aaa] font-medium text-right">
            {product.cpu_cores_threads || "N/A"}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-xs text-[#666]">
            Boost Clock:
          </span>
          <span className="text-xs text-[#aaa] font-medium text-right">
            {product.cpu_boost_clock || "N/A"}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-xs text-[#666]">
            TDP:
          </span>
          <span className="text-xs text-[#aaa] font-medium text-right">
            {product.cpu_tdp || "N/A"}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-xs text-[#666]">
            Cinebench R23 Multi:
          </span>
          <span className="text-xs text-[#aaa] font-medium text-right">
            {product.cpu_benchmark_cinebench_r23_multi
              ? Number(
                  product.cpu_benchmark_cinebench_r23_multi
                ).toLocaleString()
              : "N/A"}
          </span>
        </div>

      </div>
    )}

    {/* Price */}
    <div className="flex items-center justify-between pt-2">
      <span className="text-xl font-bold text-white">
        {product.price
          ? `$${product.price.toFixed(2)}`
          : "N/A"}
      </span>

      <span className="text-xs text-[#555]">
        {product.retailer}
      </span>
    </div>

    {/* Retailer Link */}
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-200"
    >
      <img
  src="/newegg-logo.svg"
  alt="Newegg"
  className="h-5 w-auto object-contain"
/>

      <span>
        Link to {product.retailer || "Newegg"}
      </span>

      <span className="text-xs">
        ↗
      </span>
    </a>

  </div>
</div>
);
}
