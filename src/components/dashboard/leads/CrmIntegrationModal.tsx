'use client';

import React, { useState } from 'react';

export interface CrmInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const CRM_OPTIONS: CrmInfo[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    color: '#FF7A59',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#FF7A59">
        <path d="M17.63 13.77a3.15 3.15 0 00-1.83.59l-2.07-1.57a3.2 3.2 0 00.38-1.5c0-.46-.1-.9-.29-1.3l2.15-1.63a2.58 2.58 0 001.66.6 2.6 2.6 0 002.6-2.6 2.6 2.6 0 00-2.6-2.6 2.6 2.6 0 00-2.6 2.6c0 .3.05.58.14.85L13.1 8.79a3.22 3.22 0 00-2.35-1.01 3.23 3.23 0 00-2.36 1.03l-1.5-1.13a1.92 1.92 0 00.1-.6A1.94 1.94 0 005.05 5.14a1.94 1.94 0 00-1.94 1.94A1.94 1.94 0 005.05 9.02c.44 0 .85-.15 1.18-.4l1.49 1.12a3.22 3.22 0 00-.47 1.67c0 .62.18 1.2.48 1.7l-1.5 1.14a1.9 1.9 0 00-1.18-.41 1.94 1.94 0 00-1.94 1.94 1.94 1.94 0 001.94 1.94 1.94 1.94 0 001.94-1.94c0-.21-.04-.42-.1-.61l1.5-1.14a3.22 3.22 0 002.36 1.03 3.22 3.22 0 002.34-1.01l2.09 1.58c-.1.28-.15.58-.15.88a3.16 3.16 0 003.16 3.16 3.16 3.16 0 003.16-3.16 3.16 3.16 0 00-3.16-3.16zm-6.88-1.48a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
    ),
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    color: '#00A1E0',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#00A1E0">
        <path d="M10.05 5.82a4.26 4.26 0 013.17-1.41c1.64 0 3.07.93 3.79 2.29a4.97 4.97 0 012.03-.43c2.76 0 4.99 2.24 4.99 5s-2.23 5-4.99 5a5 5 0 01-1.09-.12 3.82 3.82 0 01-3.44 2.16 3.8 3.8 0 01-1.6-.35 4.32 4.32 0 01-3.91 2.49 4.33 4.33 0 01-3.79-2.23 3.6 3.6 0 01-.73.08c-2 0-3.62-1.63-3.62-3.63 0-1.13.52-2.14 1.33-2.8A4.37 4.37 0 011 8.84c0-2.42 1.96-4.38 4.38-4.38 1.21 0 2.31.5 3.1 1.3a4.3 4.3 0 011.57.06z" />
      </svg>
    ),
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    color: '#017737',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#017737">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    color: '#E42527',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#E42527">
        <path d="M3.87 10.58L6.3 5.2h3.28l-4.83 9.6H2.34l-1.6-3.2 1.63-3.2 1.5 2.18zm7.19-5.38h3.28l-4.83 9.6H7.1l4.83-9.6h-.87zm4.37 0h3.28l-4.83 9.6h-2.41l4.83-9.6h-.87zm4.37 0h3.28l-4.83 9.6h-2.41l4.83-9.6h-.87z" />
      </svg>
    ),
  },
  {
    id: 'close',
    name: 'Close',
    color: '#2B3D4F',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#2B3D4F">
        <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

interface CrmConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (crm: CrmInfo) => void;
}

export function CrmConnectModal({ open, onClose, onConnect }: CrmConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);

  if (!open) return null;

  const handleConnect = (crm: CrmInfo) => {
    setConnecting(crm.id);
    setTimeout(() => {
      setConnecting(null);
      setConnected(crm.id);
      setTimeout(() => {
        onConnect(crm);
        setConnected(null);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-surface-900">Connect CRM</h2>
            <p className="text-xs text-surface-500 mt-0.5">Select your CRM to sync leads automatically</p>
          </div>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600 transition-colors rounded-lg hover:bg-surface-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CRM List */}
        <div className="p-4 space-y-2">
          {CRM_OPTIONS.map((crm) => (
            <button
              key={crm.id}
              onClick={() => handleConnect(crm)}
              disabled={connecting !== null || connected !== null}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <div className="flex-shrink-0">{crm.icon}</div>
              <span className="text-sm font-medium text-surface-800 group-hover:text-indigo-700">{crm.name}</span>
              <div className="ml-auto">
                {connecting === crm.id ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-indigo-500">Connecting...</span>
                  </div>
                ) : connected === crm.id ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-xs font-medium text-green-600">Connected!</span>
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-surface-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CrmManageModalProps {
  open: boolean;
  onClose: () => void;
  connectedCrm: CrmInfo;
  lastSyncDate: string;
  onSync: () => void;
  onDisconnect: () => void;
}

export function CrmManageModal({ open, onClose, connectedCrm, lastSyncDate, onSync, onDisconnect }: CrmManageModalProps) {
  const [syncing, setSyncing] = useState(false);

  if (!open) return null;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      onSync();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-surface-900">CRM Integration</h2>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600 transition-colors rounded-lg hover:bg-surface-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Connected CRM */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <div className="flex-shrink-0">{connectedCrm.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-900">{connectedCrm.name}</p>
              <p className="text-xs text-green-600 font-medium">Connected</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </div>

          {/* Last sync */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">Last synced</span>
            <span className="text-surface-800 font-medium">{lastSyncDate}</span>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {syncing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Sync Now
                </>
              )}
            </button>
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.181 8.68l-5.45 5.45m0-5.45l5.45 5.45M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
