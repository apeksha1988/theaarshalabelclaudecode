import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Package, User } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="loading-dashboard">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
          <p className="mt-4 text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="dashboard-title">
            Welcome, {user?.name}
          </h1>
          <p className="text-[#666666]" data-testid="dashboard-subtitle">Manage your orders</p>
        </div>

        {/* User Info */}
        <div className="bg-[#F5F0E6] p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <User className="w-12 h-12 text-[#7A1F3D]" strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-serif font-medium text-[#1A1A1A]" data-testid="user-name">{user?.name}</h2>
              <p className="text-[#666666]" data-testid="user-email">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-[#7A1F3D]" strokeWidth={1.5} />
            <h2 className="text-2xl font-serif font-medium text-[#1A1A1A]" data-testid="orders-title">Your Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="bg-[#F5F0E6] p-8 text-center" data-testid="no-orders">
              <p className="text-[#666666] mb-4">You haven't placed any orders yet.</p>
              <Link to="/shop" className="text-[#7A1F3D] hover:underline">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-[#F5F0E6] p-6" data-testid={`order-${order.order_id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-[#666666]">Order #{order.order_id}</p>
                      <p className="text-lg font-serif font-medium text-[#1A1A1A] mt-1" data-testid="order-status">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-[#1A1A1A]" data-testid="order-amount">₹{(order.total / 100).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-[#666666]" data-testid={`order-item-${index}`}>
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}