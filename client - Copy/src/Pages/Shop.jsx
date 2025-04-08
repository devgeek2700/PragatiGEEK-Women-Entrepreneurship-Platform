import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

import axiosInstance from '../helpers/AxiosInstance';
import HomeLayout from '../layouts/HomeLayout';

function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        'all',
        'electronics',
        'clothing',
        'books',
        'accessories',
        'software',
        'other'
    ];

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = '/products';
            if (selectedCategory !== 'all') {
                url = `/products/category/${selectedCategory}`;
            }
            const { data } = await axiosInstance.get(url);
            setProducts(data.products);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/products/search?q=${searchQuery}`);
            setProducts(data.products);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeLayout>
            <div className="min-h-screen p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search and Category Filter */}
                    <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex-1 w-full lg:max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
                                >
                                    <FiSearch size={20} />
                                </button>
                            </div>
                        </form>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category} className="capitalize">
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            No products found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link 
                                    key={product._id} 
                                    to={`/product/${product._id}`}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <img
                                        src={product.images[0]?.secure_url || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-600 font-bold">
                                                ₹{product.price}
                                            </span>
                                            <span className="text-sm text-gray-500 capitalize">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default Shop; 