import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.name}! access further features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to={ROUTES.MY_LISTINGS} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow transition-shadow block">
          <h3 className="font-semibold text-gray-900 mb-2">My Listings</h3>
          <p className="text-gray-600 text-sm">Display your listings</p>
        </Link>

        <Link to={ROUTES.PROFILE} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow transition-shadow block">
          <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
          <p className="text-gray-600 text-sm">See your profile</p>
        </Link>

        <Link to={ROUTES.PAYMENTS} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow transition-shadow block">
          <h3 className="font-semibold text-gray-900 mb-2">Payments</h3>
          <p className="text-gray-600 text-sm">Check your Payment History</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;