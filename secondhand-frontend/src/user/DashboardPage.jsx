import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext.jsx';
import {ROUTES} from '../common/constants/routes.js';
import { 
  Package, 
  ShoppingBag, 
  User, 
  CreditCard, 
  AlertTriangle, 
  Star, 
  MessageSquare
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: "My Listings",
      description: "Manage your listings",
      route: ROUTES.MY_LISTINGS,
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "My Orders",
      description: "Track your orders",
      route: ROUTES.MY_ORDERS,
      icon: ShoppingBag,
      color: "text-green-600"
    },
    {
      title: "Profile",
      description: "Manage your profile",
      route: ROUTES.PROFILE,
      icon: User,
      color: "text-gray-600"
    },
    {
      title: "Payments",
      description: "Payment history",
      route: ROUTES.PAYMENTS,
      icon: CreditCard,
      color: "text-purple-600"
    },
    {
      title: "Complaints",
      description: "View and manage complaints",
      route: ROUTES.COMPLAINTS,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Reviews I Received",
      description: "Reviews others gave you",
      route: ROUTES.REVIEWS_RECEIVED(user?.id),
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Reviews I Gave",
      description: "Reviews you gave others",
      route: ROUTES.REVIEWS_GIVEN(user?.id),
      icon: MessageSquare,
      color: "text-indigo-600"
    },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                to={item.route}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 block group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors`}>
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;