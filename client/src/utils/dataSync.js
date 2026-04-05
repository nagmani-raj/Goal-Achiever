export const DATA_SYNC_EVENT = 'goaltracker:data-changed';

export const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_SYNC_EVENT));
  }
};
