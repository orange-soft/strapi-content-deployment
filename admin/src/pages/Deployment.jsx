import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useFetchClient, Layouts } from '@strapi/strapi/admin';
import io from 'socket.io-client';
import {
  Box,
  Button,
  Flex,
  Typography,
  Alert,
  Badge,
  Loader,
  Card,
  CardBody,
  CardContent,
  CardHeader,
  CardTitle,
} from '@strapi/design-system';
import { Play, ArrowUp } from '@strapi/icons';

const Deployment = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const [hasWebhook, setHasWebhook] = useState(true);

  useEffect(() => {
    // Check if webhook is configured
    checkWebhookConfiguration();

    // Connect to Socket.io
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    // Listen for deployment events
    newSocket.on('deployment:started', (deployment) => {
      setIsDeploying(true);
      setDeploymentStatus(deployment);
      setLogs([]);
    });

    newSocket.on('deployment:status', ({ deployment, logs: newLogs }) => {
      setDeploymentStatus(deployment);
      setLogs(newLogs);
    });

    newSocket.on('deployment:completed', (deployment) => {
      setIsDeploying(false);
      setDeploymentStatus(deployment);
      setNotification({
        type: 'success',
        message: 'Deployment completed successfully!',
      });
    });

    newSocket.on('deployment:failed', ({ error }) => {
      setIsDeploying(false);
      setNotification({
        type: 'danger',
        message: `Deployment failed: ${error}`,
      });
    });

    // Fetch current deployment status
    fetchDeploymentStatus();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const checkWebhookConfiguration = async () => {
    try {
      const { data } = await get('/api/strapi-content-deployment/settings');
      setHasWebhook(!!data.data?.webhookUrl);
    } catch (error) {
      console.error('Error checking webhook configuration:', error);
    }
  };

  const fetchDeploymentStatus = async () => {
    try {
      const { data } = await get('/api/strapi-content-deployment/deployment/status');
      setIsDeploying(data.data.isDeploying);
      setDeploymentStatus(data.data.currentDeployment);
      setLogs(data.data.logs || []);
    } catch (error) {
      console.error('Error fetching deployment status:', error);
    }
  };

  const handleDeploy = async () => {
    setNotification(null);
    try {
      const { data } = await post('/api/strapi-content-deployment/deploy');
      setNotification({
        type: 'success',
        message: data.data.message,
      });
    } catch (error) {
      console.error('Error triggering deployment:', error);
      setNotification({
        type: 'danger',
        message: error.response?.data?.error?.message || 'Failed to trigger deployment',
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'warning', label: 'Pending' },
      building: { color: 'primary', label: 'Building' },
      deploying: { color: 'primary', label: 'Deploying' },
      ready: { color: 'success', label: 'Ready' },
      completed: { color: 'success', label: 'Completed' },
      error: { color: 'danger', label: 'Error' },
      canceled: { color: 'neutral', label: 'Canceled' },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'neutral', label: status || 'Unknown' };

    return <Badge active={isDeploying} textColor={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <Layouts.Root>
      <Layouts.Header
        title="Deployments"
        subtitle="Trigger and monitor your Vercel deployments"
        primaryAction={
          hasWebhook && (
            <Button
              onClick={handleDeploy}
              loading={isDeploying}
              disabled={isDeploying}
              startIcon={<Play />}
              size="L"
              variant="default"
            >
              {isDeploying ? 'Deploying...' : 'Deploy to Vercel'}
            </Button>
          )
        }
      />
      <Layouts.Content>
          {notification && (
            <Box paddingBottom={4}>
              <Alert
                closeLabel="Close"
                title={notification.message}
                variant={notification.type}
                onClose={() => setNotification(null)}
              />
            </Box>
          )}

          {!hasWebhook && (
            <Box paddingBottom={4}>
              <Alert
                title="Webhook not configured"
                variant="warning"
              >
                Please configure your Vercel deployment webhook in the settings before triggering deployments.
              </Alert>
            </Box>
          )}

          <Flex direction="column" alignItems="stretch" gap={4}>
            {/* Current Deployment Status */}
            {deploymentStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Deployment</CardTitle>
                </CardHeader>
                <CardBody>
                  <CardContent>
                    <Flex direction="column" alignItems="stretch" gap={3}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Typography variant="sigma">Status</Typography>
                        {getStatusBadge(deploymentStatus.status)}
                      </Flex>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Typography variant="sigma">Started</Typography>
                        <Typography variant="pi">
                          {new Date(deploymentStatus.startedAt).toLocaleString()}
                        </Typography>
                      </Flex>
                      {deploymentStatus.completedAt && (
                        <Flex justifyContent="space-between" alignItems="center">
                          <Typography variant="sigma">Completed</Typography>
                          <Typography variant="pi">
                            {new Date(deploymentStatus.completedAt).toLocaleString()}
                          </Typography>
                        </Flex>
                      )}
                      {deploymentStatus.vercelUrl && (
                        <Flex justifyContent="space-between" alignItems="center">
                          <Typography variant="sigma">Deployment URL</Typography>
                          <a href={deploymentStatus.vercelUrl} target="_blank" rel="noopener noreferrer">
                            <Typography variant="pi" textColor="primary600">
                              View on Vercel <ArrowUp />
                            </Typography>
                          </a>
                        </Flex>
                      )}
                    </Flex>
                  </CardContent>
                </CardBody>
              </Card>
            )}

            {/* Deployment Logs */}
            {(isDeploying || logs.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Deployment Logs
                    {isDeploying && (
                      <Box paddingLeft={2} display="inline-block">
                        <Loader small />
                      </Box>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <CardContent>
                    <Box
                      background="neutral800"
                      hasRadius
                      padding={4}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                      }}
                    >
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <Box key={index} paddingBottom={1}>
                            <Typography
                              variant="pi"
                              textColor={
                                log.type === 'error' ? 'danger500' :
                                log.type === 'warning' ? 'warning500' :
                                'neutral0'
                              }
                            >
                              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="pi" textColor="neutral300">
                          Waiting for deployment logs...
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardBody>
              </Card>
            )}

            {/* Instructions */}
            {!deploymentStatus && !isDeploying && (
              <Card>
                <CardBody>
                  <CardContent>
                    <Flex direction="column" alignItems="center" justifyContent="center" gap={3} padding={6}>
                      <Typography variant="alpha" textColor="neutral600" textAlign="center">
                        No active deployments
                      </Typography>
                      <Typography variant="epsilon" textColor="neutral600" textAlign="center">
                        Click the "Deploy to Vercel" button to trigger a new deployment.
                        {!hasWebhook && " But first, configure your webhook in settings."}
                      </Typography>
                    </Flex>
                  </CardContent>
                </CardBody>
              </Card>
            )}
          </Flex>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default Deployment;
