'use client'

import { useProduct } from '@/components/providers/product_provider'
import { useRouter } from "next/navigation";
export default function ProductPage() {
  const { selectedProduct } = useProduct()
  const router = useRouter();

  if (!selectedProduct) {
    return (
      <div className="p-10 text-center">
        No product selected.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="
        mb-6
        flex
        items-center
        gap-2
        rounded-xl
        bg-green-800
        px-5
        py-2.5
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-green-900
      "
        >
          ← Back
        </button>

        <div className="grid gap-10 rounded-3xl border border-green-100 bg-white p-6 shadow-xl md:grid-cols-2 lg:p-10">

          {/* Product Image */}
          <div className="flex items-center justify-center rounded-2xl bg-green-50 p-6">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="h-[450px] w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>


          {/* Product Details */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            <span className="mb-3 w-fit rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-800">
              {selectedProduct.category}
            </span>


            {/* Product Name */}
            <h1 className="text-4xl font-extrabold tracking-tight text-green-950">
              {selectedProduct.name}
            </h1>


            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-yellow-500">
                ★★★★★
              </div>

              <span className="text-sm text-gray-500">
                Premium Quality
              </span>
            </div>


            {/* Price */}
            <div className="mt-6 flex items-center gap-3">

              <span className="text-4xl font-bold text-green-700">
                ₹{selectedProduct.price}
              </span>

              {selectedProduct.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{selectedProduct.originalPrice}
                </span>
              )}

            </div>


            {/* Description */}
            <p className="mt-6 leading-7 text-gray-600">
              {selectedProduct.description}
            </p>


            {/* Features */}
            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-gray-500">
                  Availability
                </p>
                <p className="font-semibold text-green-700">
                  In Stock
                </p>
              </div>


              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-gray-500">
                  Delivery
                </p>
                <p className="font-semibold text-green-700">
                  Fast Shipping
                </p>
              </div>

            </div>


            {/* Buttons */}
            {/* <div className="mt-8 flex gap-4">

              <button
                className="
              flex-1 rounded-xl 
              bg-green-800 
              px-6 py-3 
              font-semibold 
              text-white
              transition
              hover:bg-green-900
            "
              >
                Add To Cart
              </button>


              <button
                className="
              flex-1 rounded-xl
              border-2
              border-green-800
              px-6 py-3
              font-semibold
              text-green-800
              transition
              hover:bg-green-50
            "
              >
                Buy Now
              </button>

            </div> */}

          </div>

        </div>
      </div>
    </div>
  )
}