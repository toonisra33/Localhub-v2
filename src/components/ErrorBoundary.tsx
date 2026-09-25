import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.removeItem('locallink_active_tab');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen max-w-md mx-auto bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">
            เกิดข้อผิดพลาดในการแสดงผล
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            ระบบตรวจพบข้อผิดพลาดที่ไม่คาดคิด กรุณากดปุ่มด้านล่างเพื่อเริ่มการทำงานใหม่
          </p>

          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <RefreshCw size={16} />
              โหลดหน้านี้ใหม่อีกครั้ง
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Home size={16} />
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
