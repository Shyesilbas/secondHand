import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext.jsx';
import {ROUTES} from '../common/constants/routes.js';

const DashboardPage = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: "My Listings",
      description: "Manage your listings",
      route: ROUTES.MY_LISTINGS
    },
    {
      title: "My Orders",
      description: "Track your orders",
      route: ROUTES.MY_ORDERS
    },
    {
      title: "Profile",
      description: "Manage your profile",
      route: ROUTES.PROFILE
    },
    {
      title: "Payments",
      description: "Payment history",
      route: ROUTES.PAYMENTS
    },
    {
      title: "Complaints",
      description: "View and manage complaints",
      route: ROUTES.COMPLAINTS
    },
    {
      title: "Reviews I Received",
      description: "Reviews others gave you",
      route: ROUTES.REVIEWS_RECEIVED(user?.id)
    },
    {
      title: "Reviews I Gave",
      description: "Reviews you gave others",
      route: ROUTES.REVIEWS_GIVEN(user?.id)
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage your account and activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className="bg-white p-6 rounded border border-gray-200 hover:border-gray-300 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;