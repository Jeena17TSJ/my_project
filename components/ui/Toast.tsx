'use client';
import { Toaster, toast as hotToast } from 'react-hot-toast';

// Re-export for convenience
export const toast = {
  success: (msg: string) => hotToast.success(msg, {
    style: {
      borderRadius: '12px',
      background:   '#f0fdf4',
      color:        '#166534',
      border:       '1px solid #bbf7d0',
      fontSize:     '14px',
    },
    iconTheme: { primary: '#22c55e', secondary: '#fff' },
  }),
  error: (msg: string) => hotToast.error(msg, {
    style: {
      borderRadius: '12px',
      background:   '#fef2f2',
      color:        '#991b1b',
      border:       '1px solid #fecaca',
      fontSize:     '14px',
    },
    iconTheme: { primary: '#ef4444', secondary: '#fff' },
  }),
  info: (msg: string) => hotToast(msg, {
    style: {
      borderRadius: '12px',
      background:   '#eff6ff',
      color:        '#1e40af',
      border:       '1px solid #bfdbfe',
      fontSize:     '14px',
    },
    icon: 'ℹ️',
  }),
  loading: (msg: string) => hotToast.loading(msg, {
    style: {
      borderRadius: '12px',
      fontSize:     '14px',
    },
  }),
  dismiss: hotToast.dismiss,
};

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{ duration: 4000 }}
    />
  );
}
