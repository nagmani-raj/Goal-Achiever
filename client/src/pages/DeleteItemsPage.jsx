import { useNotifications } from '../context/NotificationContext';
import { useStoredItems } from '../hooks/useStoredItems';
import './DeleteItemsPage.css';

const DeleteItemsPage = () => {
  const { items, loading, deletingId, deleteItem } = useStoredItems();
  const { showError, showSuccess } = useNotifications();

  const handleDelete = async (item) => {
    try {
      await deleteItem(item);
      showSuccess('Item deleted successfully.');
    } catch (error) {
      console.error('Error deleting stored item:', error);
      showError(error?.response?.data?.message || 'Unable to delete item');
    }
  };

  return (
    <div className="delete-items-page">
      <div className="delete-items-header">
        <div>
          <h2 className="page-title">Delete Items</h2>
          <p className="date-display">Review stored titles by section and remove them from both UI and database.</p>
        </div>
        <div className="delete-items-count glass">
          <span>Total Items</span>
          <strong>{items.length}</strong>
        </div>
      </div>

      <div className="delete-items-board glass">
        {loading ? (
          <div className="loading-text">Loading stored items...</div>
        ) : items.length === 0 ? (
          <div className="delete-items-empty">
            <div className="delete-items-empty-icon">0</div>
            <p>No stored titles found.</p>
            <p className="delete-items-empty-sub">Add a monthly goal, daily topic, or target topic and it will appear here.</p>
          </div>
        ) : (
          <div className="delete-items-list">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="delete-items-card glass animate-slideInUp"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="delete-items-copy">
                  <strong title={item.title}>{item.title}</strong>
                  <span>{item.location}</span>
                </div>
                <button
                  type="button"
                  className="delete-items-button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteItemsPage;
