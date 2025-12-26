import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {campaignService} from '../../listing/services/campaignService.js';
import {listingService} from '../../listing/services/listingService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';
import {formatDateTime} from '../../common/formatters.js';
import {ArrowLeft, Clock, Edit2, Plus, RefreshCw, Tag, Trash2} from 'lucide-react';

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
      const res = await listingService.getMyListings(0, 50);
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

  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.active).length;
    const inactive = campaigns.filter(c => !c.active).length;
    return {
      total: campaigns.length,
      active,
      inactive
    };
  }, [campaigns]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.DASHBOARD} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm font-semibold text-gray-900">Campaigns</h1>
            {campaigns.length > 0 && (
              <span className="text-xs text-gray-500">({stats.total})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCampaign(null);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-white border border-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Tag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-xs text-gray-600 mb-4">No campaigns yet</p>
            <button
              type="button"
              onClick={() => {
                setEditingCampaign(null);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Campaign Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Discount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Period</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Apply to Future Listings</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Scope</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-900">{c.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                        {c.applyToFutureListings && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            Future
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-indigo-600">
                        {c.discountKind === 'PERCENT' ? `${c.value}%` : `₺${c.value}`}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-600">
                        {c.startsAt || c.endsAt 
                          ? `${c.startsAt ? formatDateTime(c.startsAt) : 'Any'} → ${c.endsAt ? formatDateTime(c.endsAt) : 'Any'}`
                          : 'No limit'}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-600">
                        {c.applyToFutureListings ? 'Yes' : 'No'}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-600">
                        {c.eligibleListingIds && c.eligibleListingIds.length > 0
                          ? `${c.eligibleListingIds.length} listing${c.eligibleListingIds.length > 1 ? 's' : ''}`
                          : c.eligibleTypes && c.eligibleTypes.length > 0
                            ? c.eligibleTypes.join(', ')
                            : 'All listings'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampaign(c);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCampaign(c.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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


