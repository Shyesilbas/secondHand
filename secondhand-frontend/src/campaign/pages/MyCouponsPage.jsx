import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { campaignService } from '../../listing/services/campaignService.js';
import { listingService } from '../../listing/services/listingService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';

const MyCouponsPage = () => {
  const { showError, showSuccess } = useNotification();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [listingTitleById, setListingTitleById] = useState({});

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await campaignService.listMine();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      setCampaigns([]);
      showError('Kuponlarım', e?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadListingTitles = async () => {
    try {
      const res = await listingService.getMyListings(0, 500);
      const items = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      const map = {};
      items.forEach((l) => {
        if (l?.id) {
          map[l.id] = l.title || l.listingNo || l.id;
        }
      });
      setListingTitleById(map);
    } catch {
      setListingTitleById({});
    }
  };

  useEffect(() => {
    load();
    loadListingTitles();
  }, []);

  const deleteCampaign = async (id) => {
    try {
      await campaignService.remove(id);
      showSuccess('Deleted', 'Campaign deleted.');
      await load();
    } catch (e) {
      showError('Delete failed', e?.response?.data?.message || 'Failed to delete campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Kuponlarım</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage seller campaigns. Public coupons will be added later.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.DASHBOARD}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCampaign(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Create Campaign
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Campaigns</div>
            {isLoading && <div className="text-xs text-gray-500">Loading…</div>}
          </div>

          {campaigns.length === 0 && !isLoading ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-gray-900">No campaigns yet</div>
              <div className="text-sm text-gray-600 mt-1">Create your first campaign to show discounted prices on your listings.</div>
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setIsModalOpen(true);
                }}
                className="mt-5 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <div key={c.id} className="p-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-base font-semibold text-gray-900 truncate">{c.name}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {c.discountKind === 'PERCENT' ? `${c.value}%` : `${c.value}`} discount
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(c.startsAt || c.endsAt) ? `${c.startsAt || 'Any'} → ${c.endsAt || 'Any'}` : 'No date limit'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(c.eligibleListingIds && c.eligibleListingIds.length > 0)
                        ? `Selected listings (${c.eligibleListingIds.length})`
                        : (c.eligibleTypes && c.eligibleTypes.length > 0)
                          ? `Types: ${c.eligibleTypes.join(', ')}`
                          : 'All my listings'}
                    </div>
                    {c.eligibleListingIds && c.eligibleListingIds.length > 0 && (
                      <div className="text-xs text-gray-700 mt-2">
                        <span className="font-semibold text-gray-900">Applied to:</span>{' '}
                        {c.eligibleListingIds
                          .map((id) => listingTitleById[id] || id)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCampaign(c);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCampaign(c.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={load}
        editingCampaign={editingCampaign}
      />
    </div>
  );
};

export default MyCouponsPage;

