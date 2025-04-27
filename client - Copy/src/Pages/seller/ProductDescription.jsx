import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";

import HomeLayout from "../../layouts/HomeLayout";

function ProductDescription() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { role, data } = useSelector((state) => state.auth);

  const handleEdit = () => {
    navigate(`/seller/products/edit/${state._id}`, {
      state: state,
    });
  };

  return (
    <HomeLayout>
      <div className="flex flex-col lg:flex-row lg:px-20 py-12 bg-gray-100 rounded-lg shadow-lg">
        <div className="lg:w-1/2 w-full px-12 flex flex-col gap-7">
          <div className="flex justify-between items-center">
            <img
              src={state.images[0]?.secure_url}
              alt="product"
              className="rounded-xl w-full h-96 object-cover"
            />
            {role === "SELLER" && data._id === state.seller && (
              <button
                onClick={handleEdit}
                className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                <FiEdit2 size={24} />
              </button>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="font-semibold lg:text-2xl text-xl text-yellow-400 capitalize">
              Category:{" "}
              <span className="text-xl text-blue-500">{state.category}</span>
            </p>
            <p className="font-semibold lg:text-2xl text-xl text-yellow-400 capitalize">
              Stock:{" "}
              <span className="text-xl text-blue-500">{state.stock}</span>
            </p>
            <p className="font-semibold lg:text-2xl text-xl text-yellow-400 capitalize">
              Price:{" "}
              <span className="text-xl text-blue-500">₹{state.price}</span>
            </p>
            <button
              className="btn btn-primary capitalize mt-4"
              onClick={() =>
                navigate(`/products/${state._id}/checkout`, { state: state })
              }
            >
              Buy Now
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 w-full px-12 py-12 flex flex-col gap-4">
          <h1 className="font-bold text-yellow-500 lg:text-4xl text-2xl capitalize">
            {state.name}
          </h1>
          <p className="font-semibold lg:text-2xl text-xl text-amber-500 capitalize">
            Product Description:
          </p>
          <p className="font-semibold lg:text-xl text-base text-gray-700 normal-case tracking-wider">
            {state.description}
          </p>
        </div>
      </div>
    </HomeLayout>
  );
}

export default ProductDescription;
