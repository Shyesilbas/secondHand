import { get, post, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * İade talebi oluştur
 * @param {Object} data - İade talebi verisi
 * @param {number} data.orderId - Sipariş ID
 * @param {number} data.orderItemId - Sipariş item ID
 * @param {string} data.reason - İade nedeni
 * @returns {Promise<Object>} İade talebi
 */
export const createRefundRequest = async (data) => {
  return await post(API_ENDPOINTS.REFUNDS.CREATE_REFUND_REQUEST, data);
};

/**
 * İade talebini getir
 * @param {number} id - İade talebi ID
 * @returns {Promise<Object>} İade talebi
 */
export const getRefundRequest = async (id) => {
  return await get(API_ENDPOINTS.REFUNDS.GET_REFUND_DETAILS(id));
};

/**
 * Kullanıcının tüm iade taleplerini getir
 * @param {Object} params - Sayfalama parametreleri
 * @returns {Promise<Object>} İade talepleri listesi (paginated)
 */
export const getUserRefundRequests = async (params = {}) => {
  return await get(API_ENDPOINTS.REFUNDS.LIST_MY_REFUNDS, { params });
};


export const getOrderRefundRequests = async (orderId, params = {}) => {
  return await get(API_ENDPOINTS.REFUNDS.GET_ORDER_REFUNDS(orderId), { params });
};


export const cancelRefundRequest = async (id) => {
  return await del(API_ENDPOINTS.REFUNDS.CANCEL_REFUND(id));
};

export const canCancelOrder = async (orderId) => {
  return await get(API_ENDPOINTS.REFUNDS.CHECK_ORDER_CANCELLABLE(orderId));
};

export const canCancelOrderItem = async (orderItemId) => {
  return await get(API_ENDPOINTS.REFUNDS.CHECK_ITEM_CANCELLABLE(orderItemId));
};
