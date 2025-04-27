import { useNavigate } from "react-router-dom";

function ProductCard({ data }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/seller/products/${data._id}`, { state: data })}
      className="card w-96 bg-white border rounded-lg border-gray-300 cursor-pointer"
    >
      <figure>
        <img
          src={data.images[0]?.secure_url}
          alt="product thumbnail"
          className="w-full h-60 object-cover rounded-t-lg"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-xl text-black font-semibold">
          {data.name}
          <span className="badge badge-primary text-xs ml-2">
            ₹{data.price}
          </span>
        </h2>
        <p className="font-medium text-black">
          Stock: <span className="text-black">{data.stock}</span>
        </p>
        <div className="card-actions justify-end">
          <div className="badge badge-outline capitalize py-2 px-3 border-black border-2 text-black">
            {data.category}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
