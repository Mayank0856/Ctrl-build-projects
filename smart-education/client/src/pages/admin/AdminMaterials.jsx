import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiPlus, FiTrash2, FiFile } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/materials');
      setMaterials(res.data);
    } catch (e) {
      toast.error('Failed to load admin materials.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/materials/${id}`); // Assuming delete is open/admin guarded in materials router
      toast.success('Material deleted');
      fetchMaterials();
    } catch (e) {
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Library Materials</h1>
          <p className="text-muted text-sm mt-1">Manage global curriculum and resources</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Material
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-muted text-sm border-b border-white/10 bg-white/5">
                <th className="py-3 px-4 font-medium">Title / Topic</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Added On</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-muted">Loading materials...</td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-muted">No materials found. Click "Add Material" to create one.</td>
                </tr>
              ) : (
                materials.map(mat => (
                  <tr key={mat._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <FiFile className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{mat.title}</p>
                          <p className="text-xs text-muted max-w-xs truncate">{mat.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{mat.subjectCategory}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(mat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => deleteMaterial(mat._id)} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMaterials;
