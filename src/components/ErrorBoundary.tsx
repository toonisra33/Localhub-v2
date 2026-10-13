import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[LocalHub ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-['Prompt',sans-serif]">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4 border border-red-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-white">เกิดข้อผิดพลาดในการแสดงผล</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            ระบบตรวจพบข้อผิดพลาดที่ไม่คาดคิด สามารถกดปุ่มด้านล่างเพื่อล้างข้อมูลชั่วคราวและเปิดหน้าจอใหม่อีกครั้ง
          </p>
          {this.state.error && (
            <div className="max-w-md w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-left text-xs font-mono text-red-300 mb-6 overflow-auto max-h-32 select-all break-words">
              {this.state.error.message && this.state.error.message.includes('Minified React error #31') ? (
                <div>
                  <div className="font-bold text-amber-300 mb-1">React Error #31: ตรวจพบ Object ในช่องแสดงผลข้อความ</div>
                  <div>{decodeURIComponent(this.state.error.message)}</div>
                </div>
              ) : (
                this.state.error.message || String(this.state.error)
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ล้างแคช & รีโหลดใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
