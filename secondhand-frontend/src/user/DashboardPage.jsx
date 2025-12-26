import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import { 
  Package, 
  ShoppingBag, 
  User, 
  CreditCard, 
  AlertTriangle, 
  Star, 
  MessageSquare,
  Tag,
  HandCoins,
  ArrowRight,
  Settings,
  Receipt,
  Heart,
  Mail,
  TrendingUp
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const dashboardSections = useMemo(() => [
    {
      title: 'Sales & Listings',
      items: [
        {
          title: "My Listings",
          description: "Manage your active listings",
          route: ROUTES.MY_LISTINGS,
          icon: Package,
          color: "bg-blue-500",
          hoverColor: "hover:bg-blue-600"
        },
        {
          title: "Create Listing",
          description: "Add a new listing",
          route: ROUTES.CREATE_LISTING,
          icon: TrendingUp,
          color: "bg-emerald-500",
          hoverColor: "hover:bg-emerald-600"
        },
        {
          title: "My Coupons",
          description: "Manage your campaigns",
          route: ROUTES.MY_COUPONS,
          icon: Tag,
          color: "bg-purple-500",
          hoverColor: "hover:bg-purple-600"
        }
      ]
    },
    {
      title: 'Orders & Purchases',
      items: [
        {
          title: "My Orders",
          description: "Track your orders",
          route: ROUTES.MY_ORDERS,
          icon: ShoppingBag,
          color: "bg-green-500",
          hoverColor: "hover:bg-green-600"
        },
        {
          title: "Offers",
          description: "Offers you made and received",
          route: ROUTES.OFFERS,
          icon: HandCoins,
          color: "bg-amber-500",
          hoverColor: "hover:bg-amber-600"
        },
        {
          title: "Favorites",
          description: "Your saved listings",
          route: ROUTES.FAVORITES,
          icon: Heart,
          color: "bg-pink-500",
          hoverColor: "hover:bg-pink-600"
        }
      ]
    },
    {
      title: 'Account & Settings',
      items: [
        {
          title: "Profile",
          description: "Manage your profile",
          route: ROUTES.PROFILE,
          icon: User,
          color: "bg-gray-500",
          hoverColor: "hover:bg-gray-600"
        },
        {
          title: "Change Password",
          description: "Update your password",
          route: ROUTES.CHANGE_PASSWORD,
          icon: Settings,
          color: "bg-slate-500",
          hoverColor: "hover:bg-slate-600"
        }
      ]
    },
    {
      title: 'Payments & Financial',
      items: [
        {
          title: "Payment History",
          description: "View all transactions",
          route: ROUTES.PAYMENTS,
          icon: Receipt,
          color: "bg-indigo-500",
          hoverColor: "hover:bg-indigo-600"
        },
        {
          title: "Payment Methods",
          description: "Manage payment options",
          route: ROUTES.PAYMENT_METHODS,
          icon: CreditCard,
          color: "bg-violet-500",
          hoverColor: "hover:bg-violet-600"
        },
        {
          title: "Pay Listing Fee",
          description: "Pay for listing creation",
          route: ROUTES.PAY_LISTING_FEE,
          icon: CreditCard,
          color: "bg-cyan-500",
          hoverColor: "hover:bg-cyan-600"
        }
      ]
    },
    {
      title: 'Reviews & Communication',
      items: [
        {
          title: "Reviews I Received",
          description: "Reviews others gave you",
          route: ROUTES.REVIEWS_RECEIVED(user?.id),
          icon: Star,
          color: "bg-yellow-500",
          hoverColor: "hover:bg-yellow-600"
        },
        {
          title: "Reviews I Gave",
          description: "Reviews you gave others",
          route: ROUTES.REVIEWS_GIVEN(user?.id),
          icon: MessageSquare,
          color: "bg-teal-500",
          hoverColor: "hover:bg-teal-600"
        },
        {
          title: "Complaints",
          description: "View and manage complaints",
          route: ROUTES.COMPLAINTS,
          icon: AlertTriangle,
          color: "bg-red-500",
          hoverColor: "hover:bg-red-600"
        }
      ]
    }
  ], [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1.5 text-sm">
                Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>! Manage your account and activities.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {dashboardSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>

              {/* Section Items */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, itemIndex) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={itemIndex}
                        to={item.route}
                        className="group relative flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 ${item.color} ${item.hoverColor} rounded-lg flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.CREATE_LISTING}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Browse Listings</span>
            </Link>
            <Link
              to={ROUTES.MY_ORDERS}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Orders</span>
            </Link>
            <Link
              to={ROUTES.PROFILE}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
