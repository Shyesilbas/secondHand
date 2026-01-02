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
  TrendingUp,
  BarChart3,
  LineChart
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
          color: "bg-secondary-500",
          hoverColor: "hover:bg-secondary-600"
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
    },
    {
      title: 'Analytics & Insights',
      items: [
        {
          title: "Seller Analytics",
          description: "View sales performance and statistics",
          route: ROUTES.SELLER_DASHBOARD,
          icon: BarChart3,
          color: "bg-indigo-500",
          hoverColor: "hover:bg-indigo-600"
        },
        {
          title: "Buyer Analytics",
          description: "Track your purchases and spending",
          route: ROUTES.BUYER_DASHBOARD,
          icon: LineChart,
          color: "bg-blue-500",
          hoverColor: "hover:bg-blue-600"
        }
      ]
    }
  ], [user?.id]);

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Dashboard
              </h1>
              <p className="text-text-secondary mt-1.5 text-sm">
                Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>! Manage your account and activities.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-text-inverse" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {dashboardSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-background-primary rounded-xl border border-border-light shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-4 bg-secondary-50 border-b border-border-light">
                <h2 className="text-lg font-semibold text-text-primary">
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
                        className="group relative flex items-start space-x-4 p-4 rounded-lg border border-border-light hover:border-border-DEFAULT hover:shadow-md transition-all duration-200 bg-background-primary"
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 ${item.color} ${item.hoverColor} rounded-lg flex items-center justify-center text-text-inverse shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-text-secondary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-text-secondary" />
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-background-primary rounded-xl border border-border-light shadow-sm p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.CREATE_LISTING}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-indigo-600 text-text-inverse text-sm font-medium rounded-lg hover:bg-accent-indigo-700 transition-colors shadow-sm hover:shadow"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-button-secondary-bg text-button-secondary-text text-sm font-medium rounded-lg hover:bg-button-secondary-hover transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Browse Listings</span>
            </Link>
            <Link
              to={ROUTES.MY_ORDERS}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-button-secondary-bg text-button-secondary-text text-sm font-medium rounded-lg hover:bg-button-secondary-hover transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Orders</span>
            </Link>
            <Link
              to={ROUTES.PROFILE}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-button-secondary-bg text-button-secondary-text text-sm font-medium rounded-lg hover:bg-button-secondary-hover transition-colors"
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
