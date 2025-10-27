// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.961-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-lg font-medium text-gray-900 mb-2">出現錯誤</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                頁面載入時發生錯誤，請重新整理頁面後再試。
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    重新載入
                                </button>
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    返回上頁
                                </button>
                            </div>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                                        顯示錯誤詳情 (開發模式)
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                                        <div className="text-red-600 font-bold mb-1">
                                            {this.state.error && this.state.error.toString()}
                                        </div>
                                        <div className="whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </div>
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;