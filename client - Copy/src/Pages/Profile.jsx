import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';

function Profile() {
    const userData = useSelector((state) => state.auth.data);

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-8">
                            <div className="flex flex-col items-center">
                                <img
                                    src={userData?.avatar?.secure_url}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                                />
                                <h1 className="mt-4 text-3xl font-bold text-white">
                                    {userData?.name}
                                </h1>
                                <p className="text-blue-100">{userData?.email}</p>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="px-4 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Account Details
                                    </h2>
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Role:</span>{' '}
                                            {userData?.role}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Joined:</span>{' '}
                                            {new Date(userData?.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {userData?.role === 'SELLER' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Store Details
                                        </h2>
                                        <div className="space-y-2">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Store Name:</span>{' '}
                                                {userData?.storeName}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Description:</span>{' '}
                                                {userData?.storeDescription}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    to="/profile/changePassword"
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Change Password
                                </Link>
                                {userData?.role === 'SELLER' && (
                                    <Link
                                        to="/seller/dashboard"
                                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Seller Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default Profile; 