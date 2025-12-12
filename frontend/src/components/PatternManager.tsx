import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, Shield } from 'lucide-react';
import { scamPatterns as initialPatterns } from '../data/scamPatterns';

export function PatternManager() {
  const [patterns, setPatterns] = useState(initialPatterns);
  const [isAddingPattern, setIsAddingPattern] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    keywords: '',
    phrases: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPattern = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      severity: formData.severity,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      phrases: formData.phrases.split(',').map(p => p.trim()).filter(Boolean),
    };

    if (editingId) {
      setPatterns(patterns.map(p => p.id === editingId ? newPattern : p));
      setEditingId(null);
    } else {
      setPatterns([...patterns, newPattern]);
    }

    setIsAddingPattern(false);
    setFormData({
      name: '',
      description: '',
      severity: 'medium',
      keywords: '',
      phrases: '',
    });
  };

  const handleEdit = (pattern: any) => {
    setEditingId(pattern.id);
    setFormData({
      name: pattern.name,
      description: pattern.description,
      severity: pattern.severity,
      keywords: pattern.keywords.join(', '),
      phrases: pattern.phrases.join(', '),
    });
    setIsAddingPattern(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pattern?')) {
      setPatterns(patterns.filter(p => p.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAddingPattern(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      severity: 'medium',
      keywords: '',
      phrases: '',
    });
  };

  const severityColors = {
    low: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    medium: 'bg-orange-500/10 border-orange-500/30 text-orange-500',
    high: 'bg-red-500/10 border-red-500/30 text-red-500',
    critical: 'bg-red-600/10 border-red-600/30 text-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white mb-2">Scam Pattern Database</h2>
          <p className="text-slate-400">
            Manage detection patterns for identifying social engineering attempts
          </p>
        </div>
        <button
          onClick={() => setIsAddingPattern(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pattern
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAddingPattern && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white mb-4">
            {editingId ? 'Edit Pattern' : 'Add New Pattern'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">Pattern Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., CEO Fraud / Executive Impersonation"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                placeholder="Describe the scam pattern and common tactics..."
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Keywords (comma-separated)</label>
              <input
                type="text"
                required
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="urgent, wire transfer, password, verify"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Phrases (comma-separated)</label>
              <textarea
                required
                value={formData.phrases}
                onChange={(e) => setFormData({ ...formData, phrases: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                placeholder="need this right away, verify your password, send the money now"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {editingId ? 'Update Pattern' : 'Add Pattern'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  pattern.severity === 'critical' ? 'text-red-600' :
                  pattern.severity === 'high' ? 'text-red-500' :
                  pattern.severity === 'medium' ? 'text-orange-500' :
                  'text-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white mb-1">{pattern.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs uppercase tracking-wide border ${
                    severityColors[pattern.severity]
                  }`}>
                    {pattern.severity}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => handleEdit(pattern)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pattern.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-400 mb-4">{pattern.description}</p>

            <div className="space-y-3">
              <div>
                <div className="text-slate-500 mb-2">Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {pattern.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-2">Trigger Phrases</div>
                <div className="flex flex-wrap gap-2">
                  {pattern.phrases.slice(0, 3).map((phrase, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400"
                    >
                      "{phrase}"
                    </span>
                  ))}
                  {pattern.phrases.length > 3 && (
                    <span className="px-2 py-1 text-slate-500">
                      +{pattern.phrases.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 mb-1">Total Patterns</div>
          <div className="text-white text-2xl">{patterns.length}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-red-400 mb-1">Critical</div>
          <div className="text-white text-2xl">
            {patterns.filter(p => p.severity === 'critical').length}
          </div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-orange-400 mb-1">High Risk</div>
          <div className="text-white text-2xl">
            {patterns.filter(p => p.severity === 'high').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-yellow-400 mb-1">Medium/Low</div>
          <div className="text-white text-2xl">
            {patterns.filter(p => p.severity === 'medium' || p.severity === 'low').length}
          </div>
        </div>
      </div>

      {/* Backend Hook Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 mb-2">Backend Integration Point</h4>
            <p className="text-slate-300 mb-3">
              This pattern database is currently stored in-memory. Connect your ML backend to:
            </p>
            <ul className="text-slate-300 space-y-1">
              <li>• Sync patterns with your production database</li>
              <li>• Train ML models on updated patterns</li>
              <li>• Export pattern matching logic to your real-time engine</li>
              <li>• Track pattern effectiveness and false positive rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
