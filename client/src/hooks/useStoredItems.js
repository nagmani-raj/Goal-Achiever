import { useCallback, useEffect, useState } from 'react';
import { dailyAPI, monthlyAPI, targetAPI } from '../services/api';
import { DATA_SYNC_EVENT, notifyDataChanged } from '../utils/dataSync';

export const useStoredItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const [monthlyRes, dailyRes, targetRes] = await Promise.all([
        monthlyAPI.getAll(),
        dailyAPI.getAllTopics(),
        targetAPI.getAll(),
      ]);

      const monthlyItems = (monthlyRes.data.data || []).map((item) => ({
        id: `monthly-${item._id}`,
        itemId: item._id,
        title: item.target,
        location: 'Monthly Goals',
        type: 'monthly',
      }));

      const dailyItems = (dailyRes.data.data || []).map((item) => ({
        id: `daily-${item._id}`,
        itemId: item._id,
        title: item.title,
        location: 'Daily Goals',
        type: 'daily',
        date: item.date,
      }));

      const targetItems = (targetRes.data.data || []).map((item) => ({
        id: `target-${item._id}`,
        itemId: item._id,
        title: item.title,
        location: 'Target Topics',
        type: 'target',
      }));

      setItems([...monthlyItems, ...dailyItems, ...targetItems]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();

    const handleDataChange = () => {
      loadItems();
    };

    window.addEventListener(DATA_SYNC_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_SYNC_EVENT, handleDataChange);
  }, [loadItems]);

  const deleteItem = useCallback(async (item) => {
    setDeletingId(item.id);
    try {
      if (item.type === 'monthly') {
        await monthlyAPI.delete(item.itemId);
      } else if (item.type === 'daily') {
        await dailyAPI.deleteTopic(item.date, item.itemId);
      } else {
        await targetAPI.delete(item.itemId);
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      notifyDataChanged();
    } finally {
      setDeletingId('');
    }
  }, []);

  return {
    items,
    loading,
    deletingId,
    deleteItem,
    reloadItems: loadItems,
  };
};
