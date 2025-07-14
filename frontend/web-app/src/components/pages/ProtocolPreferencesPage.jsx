// File: frontend/web-app/src/components/pages/ProtocolPreferencesPage.jsx

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Activity
} from 'lucide-react';
import { Button, Card, Alert, Badge } from '../../../../shared/components/ui';
import { cn } from '../../../../shared/design-system';
import useAuth from '../../../../shared/hooks/useAuth';
import { apiClient } from '../../../../shared/services/api';

const ProtocolPreferencesPage = () => {
  const { user, getAuthHeaders } = useAuth();
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [availableProtocols, setAvailableProtocols] = useState([]);
  const [protocolHistory, setProtocolHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState(null);
  const [showChangeConfirm, setShowChangeConfirm] = useState(null);

  // Load current protocol and history
  useEffect(() => {
    loadProtocolData();
  }, []);

  const loadProtocolData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load current protocol
      const currentResponse = await apiClient.get('/api/v1/users/current-protocol', {
        headers: getAuthHeaders()
      });

      if (currentResponse?.protocol) {
        setCurrentProtocol(currentResponse.protocol);
      }

      // Load available protocols
      const protocolsResponse = await apiClient.get('/api/v1/protocols', {
        headers: getAuthHeaders()
      });

      if (protocolsResponse?.protocols) {
        setAvailableProtocols(protocolsResponse.protocols);
      }

      // Load protocol change history
      const historyResponse = await apiClient.get('/api/v1/users/protocol-history', {
        headers: getAuthHeaders()
      });

      if (historyResponse?.history) {
        setProtocolHistory(historyResponse.history);
      }

    } catch (err) {
      console.error('Error loading protocol data:', err);
      setError('Failed to load protocol information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProtocolChange = async (newProtocolId, reason = '') => {
    try {
      setIsChanging(true);
      setError(null);

      const response = await apiClient.post('/api/v1/users/change-protocol', {
        newProtocolId,
        reason,
        context: {
          changed_by: 'user',
          source: 'preferences_page'
        }
      }, {
        headers: getAuthHeaders()
      });

      if (response?.success) {
        // Reload data to show updated state
        await loadProtocolData();
        setShowChangeConfirm(null);
      }

    } catch (err) {
      console.error('Error changing protocol:', err);
      setError(err.response?.data?.message || 'Failed to change protocol');
    } finally {
      setIsChanging(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDurationText = (startDate, endDate = null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Settings className="mr-3 h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Protocol Preferences</h1>
        </div>
        <p className="text-gray-600">
          Manage your health protocol and track effectiveness over time
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Current Protocol */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Protocol</h2>
            {currentProtocol && (
              <Badge variant="success" className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          {currentProtocol ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {currentProtocol.protocol_name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Started {formatDate(currentProtocol.start_date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {getDurationText(currentProtocol.start_date)}
                  </div>
                  {currentProtocol.phase && (
                    <div className="flex items-center">
                      <Activity className="mr-1 h-4 w-4" />
                      Phase {currentProtocol.phase}
                    </div>
                  )}
                </div>
              </div>

              {currentProtocol.compliance_score && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Compliance Score</span>
                    <span className="text-sm font-semibold text-primary-600">
                      {Math.round(currentProtocol.compliance_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${currentProtocol.compliance_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Protocol</h3>
              <p className="text-gray-600 mb-4">
                Choose a protocol below to start tracking your health journey
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Available Protocols */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Protocols</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {availableProtocols.map((protocol) => (
              <Card 
                key={protocol.id} 
                variant="outlined" 
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                  currentProtocol?.protocol_id === protocol.id 
                    ? "border-primary-300 bg-primary-50" 
                    : "hover:border-primary-200"
                )}
                onClick={() => {
                  if (currentProtocol?.protocol_id !== protocol.id) {
                    setShowChangeConfirm(protocol);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{protocol.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                    {protocol.category && (
                      <Badge variant="secondary" className="mt-2">
                        {protocol.category}
                      </Badge>
                    )}
                  </div>
                  
                  {currentProtocol?.protocol_id === protocol.id ? (
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Protocol History */}
      {protocolHistory.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="mr-2 h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Protocol History</h2>
            </div>
            
            <div className="space-y-3">
              {protocolHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{entry.protocol_name}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : 'Present'}
                      <span className="ml-2">({getDurationText(entry.start_date, entry.end_date)})</span>
                    </div>
                  </div>
                  
                  {entry.compliance_score && (
                    <div className="text-sm font-medium text-primary-600">
                      {Math.round(entry.compliance_score * 100)}% compliance
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Protocol Change Confirmation Modal */}
      {showChangeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Protocol?
              </h3>
              
              <p className="text-gray-600 mb-4">
                You're about to switch from <strong>{currentProtocol?.protocol_name}</strong> to{' '}
                <strong>{showChangeConfirm.name}</strong>. This change will be tracked for effectiveness analysis.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => handleProtocolChange(showChangeConfirm.id, 'user_preference_change')}
                  loading={isChanging}
                  className="flex-1"
                >
                  {isChanging ? 'Changing...' : 'Confirm Change'}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowChangeConfirm(null)}
                  disabled={isChanging}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProtocolPreferencesPage;
