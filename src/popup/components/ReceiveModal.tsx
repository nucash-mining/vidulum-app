import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Select,
  Spinner,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useWalletStore } from '@/store/walletStore';
import { useNetworkStore } from '@/store/networkStore';
import { networkRegistry, getExplorerAccountUrl } from '@/lib/networks';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNetworkId?: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose, initialNetworkId }) => {
  const { selectedAccount, getAddressForChain, getBitcoinAddress, getEvmAddress } = useWalletStore();
  const { isNetworkEnabled } = useNetworkStore();
  const toast = useToast();

  const [selectedNetwork, setSelectedNetwork] = useState(initialNetworkId || '');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Get all enabled networks
  const enabledNetworks = networkRegistry.getAll().filter((n) => isNetworkEnabled(n.id));

  // Set initial network when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialNetworkId && enabledNetworks.some((n) => n.id === initialNetworkId)) {
        setSelectedNetwork(initialNetworkId);
      } else if (enabledNetworks.length > 0 && !selectedNetwork) {
        setSelectedNetwork(enabledNetworks[0].id);
      }
    }
  }, [isOpen, initialNetworkId, enabledNetworks, selectedNetwork]);

  const networkConfig = networkRegistry.get(selectedNetwork);

  // Fetch address when network changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (!networkConfig || !selectedAccount) {
        setWalletAddress('');
        return;
      }

      setLoadingAddress(true);
      try {
        let address = '';
        if (networkConfig.type === 'cosmos') {
          address = getAddressForChain(networkConfig.bech32Prefix) || '';
        } else if (networkConfig.type === 'bitcoin') {
          address = (await getBitcoinAddress(selectedNetwork)) || '';
        } else if (networkConfig.type === 'evm') {
          address = (await getEvmAddress(selectedNetwork)) || '';
        }
        setWalletAddress(address);
      } catch (error) {
        console.error('Failed to get wallet address:', error);
        setWalletAddress('');
      } finally {
        setLoadingAddress(false);
      }
    };

    if (isOpen && selectedNetwork) {
      fetchAddress();
    }
  }, [
    isOpen,
    selectedNetwork,
    selectedAccount,
    networkConfig,
    getAddressForChain,
    getBitcoinAddress,
    getEvmAddress,
  ]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: 'Address copied',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleOpenExplorer = () => {
    if (walletAddress && selectedNetwork) {
      const url = getExplorerAccountUrl(selectedNetwork, walletAddress);
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  const getNetworkTypeBadge = () => {
    if (!networkConfig) return null;
    const colors: Record<string, string> = {
      cosmos: 'purple',
      bitcoin: 'orange',
      evm: 'blue',
    };
    return (
      <Badge colorScheme={colors[networkConfig.type]} fontSize="2xs">
        {networkConfig.type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="#0a0a0a" color="white">
        <ModalHeader fontSize="lg">
          <HStack>
            <Text>Receive</Text>
            {getNetworkTypeBadge()}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Network Selector */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                Select Network
              </Text>
              <Select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                bg="#141414"
                borderColor="#2a2a2a"
                size="sm"
                _hover={{ borderColor: '#3a3a3a' }}
              >
                {enabledNetworks.map((network) => (
                  <option key={network.id} value={network.id} style={{ background: '#141414' }}>
                    {network.name} ({network.symbol})
                  </option>
                ))}
              </Select>
            </Box>

            {/* QR Code */}
            <Box textAlign="center" py={4}>
              {loadingAddress ? (
                <Box py={8}>
                  <Spinner size="lg" color="cyan.400" />
                </Box>
              ) : walletAddress ? (
                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  display="inline-block"
                >
                  <QRCodeSVG
                    value={walletAddress}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </Box>
              ) : (
                <Box py={8}>
                  <Text color="gray.500">No address available</Text>
                </Box>
              )}
            </Box>

            {/* Address Display */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                {networkConfig?.name || 'Wallet'} Address
              </Text>
              <Box
                bg="#141414"
                borderRadius="lg"
                p={3}
                borderWidth="1px"
                borderColor="#2a2a2a"
                fontFamily="mono"
                fontSize="xs"
                wordBreak="break-all"
                textAlign="center"
              >
                {loadingAddress ? (
                  <Spinner size="sm" />
                ) : (
                  walletAddress || 'No address available'
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <HStack spacing={3}>
              <Button
                flex={1}
                size="md"
                colorScheme="cyan"
                leftIcon={<CopyIcon />}
                onClick={handleCopyAddress}
                isDisabled={!walletAddress || loadingAddress}
              >
                Copy Address
              </Button>
              {networkConfig?.explorerUrl && (
                <Button
                  flex={1}
                  size="md"
                  variant="outline"
                  colorScheme="cyan"
                  leftIcon={<ExternalLinkIcon />}
                  onClick={handleOpenExplorer}
                  isDisabled={!walletAddress || loadingAddress}
                >
                  Explorer
                </Button>
              )}
            </HStack>

            {/* Warning */}
            <Box
              bg="#1a1a1a"
              borderRadius="lg"
              p={3}
              borderWidth="1px"
              borderColor="#2a2a2a"
            >
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Only send <Text as="span" color="cyan.400" fontWeight="bold">{networkConfig?.symbol || 'tokens'}</Text> on the{' '}
                <Text as="span" color="cyan.400" fontWeight="bold">{networkConfig?.name || 'selected'}</Text> network to this address.
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReceiveModal;
