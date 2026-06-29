interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  retailer: string;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-[#111111] border border-[#222222] rounded-xl overflow-hidden hover:border-[#444444] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col">
      <div className="relative bg-[#0d0d0d] h-48 flex items-center justify-center p-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-[#333] text-sm">No Image</div>
        )}
        <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-widest uppercase text-[#555] bg-[#0a0a0a] px-2 py-1 rounded-md border border-[#222]">
          {product.category}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-[#aaa] leading-snug line-clamp-2 font-medium">{product.name}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-white">
            {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
          </span>
          <span className="text-xs text-[#555]">{product.retailer}</span>
        </div>

        <a
          href={product.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center text-sm font-semibold py-2.5 rounded-lg bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-200"
        >
          View Deal →
        </a>
      </div>
    </div>
  );
}