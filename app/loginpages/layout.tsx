
import 'antd/dist/reset.css';
import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';
import { geistMono , geistSans} from '../layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
  
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 6,
              fontFamily: 'Segoe UI, Roboto, sans-serif',
            },
          }}
        >
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              minWidth:"25rem"
            }}
          >
            {children}
          </div>
        </ConfigProvider>
   
  );
}
