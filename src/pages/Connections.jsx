import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, LoadingSkeleton, EmptyState, Tabs } from '../components/common';
import { Check, X, Trash2 } from 'lucide-react';
import { connectionsService } from '../services';

export function Connections() {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [connectionsData, pendingData, sentData] = await Promise.all([
          connectionsService.getConnections(),
          connectionsService.getPendingRequests(),
          connectionsService.getSentRequests(),
        ]);
        
        setConnections(connectionsData.connections || []);
        setPendingRequests(pendingData.requests || []);
        setSentRequests(sentData.requests || []);
      } catch (err) {
        setError(err.message || 'Failed to load connections');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleAcceptRequest = async (requestId) => {
    setActionLoading(requestId);
    
    try {
      await connectionsService.acceptRequest(requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    setActionLoading(requestId);
    
    try {
      await connectionsService.rejectRequest(requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleCancelRequest = async (requestId) => {
    setActionLoading(requestId);
    
    try {
      await connectionsService.cancelRequest(requestId);
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleRemoveConnection = async (userId) => {
    setActionLoading(userId);
    
    try {
      await connectionsService.removeConnection(userId);
      setConnections(prev => prev.filter(c => c.id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to remove connection');
    } finally {
      setActionLoading(null);
    }
  };
  
  const tabs = [
    { id: 'connections', label: 'My Connections', count: connections.length },
    { id: 'pending', label: 'Pending Requests', count: pendingRequests.length },
    { id: 'sent', label: 'Sent Requests', count: sentRequests.length },
  ];
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
        Connections
      </h1>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* My Connections */}
      {activeTab === 'connections' && (
        <Card>
          <CardContent className="pt-6">
            {connections.length === 0 ? (
              <EmptyState
                icon="user"
                title="No connections yet"
                description="Start connecting with developers to build your network"
              />
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-4 p-4 bg-[var(--color-gray-50)] rounded-lg">
                    <Avatar size="lg" fallback={connection.name?.[0] || '?'} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {connection.headline}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        Connected {connection.connectedAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        loading={actionLoading === connection.id}
                        disabled={actionLoading === connection.id}
                        onClick={() => handleRemoveConnection(connection.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon="user"
                title="No pending requests"
                description="You don't have any pending connection requests"
              />
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-[var(--color-gray-50)] rounded-lg">
                    <Avatar size="lg" fallback={request.from?.name?.[0] || '?'} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {request.from?.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {request.from?.headline}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        Sent {request.sentAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        icon={Check}
                        loading={actionLoading === request.id}
                        disabled={actionLoading === request.id}
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={X}
                        loading={actionLoading === request.id}
                        disabled={actionLoading === request.id}
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {sentRequests.length === 0 ? (
              <EmptyState
                icon="user"
                title="No sent requests"
                description="You haven't sent any connection requests"
              />
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-[var(--color-gray-50)] rounded-lg">
                    <Avatar size="lg" fallback={request.to?.name?.[0] || '?'} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {request.to?.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {request.to?.headline}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        Sent {request.sentAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" size="md">
                        Pending
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        loading={actionLoading === request.id}
                        disabled={actionLoading === request.id}
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
