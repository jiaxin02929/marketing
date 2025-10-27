// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5002/api';

    // 驗證現有的 token
    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
            } else {
                // Token 無效，清除本地存儲
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                const { token: newToken, user: newUser } = data.data;
                localStorage.setItem('auth_token', newToken);
                setToken(newToken);
                setUser(newUser);
                return { success: true, user: newUser };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: '註冊失敗，請檢查網路連接' };
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                const { token: newToken, user: newUser } = data.data;
                console.log('AuthContext: Setting user data:', newUser);
                localStorage.setItem('auth_token', newToken);
                setToken(newToken);
                setUser(newUser);
                console.log('AuthContext: User state updated');
                return { success: true, user: newUser };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: '登入失敗，請檢查網路連接' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // 通知後端（可選）
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // 清除本地狀態
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
            // 導引到登入頁面
            navigate('/account');
        }
    };

    const isAuthenticated = () => {
        return !!user && !!token;
    };

    const hasRole = (role) => {
        return user && user.role === role;
    };

    const isAdmin = () => {
        return hasRole('admin');
    };

    const isAffiliate = () => {
        return hasRole('affiliate') || hasRole('admin');
    };

    const updateUser = (updatedUserData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...updatedUserData
        }));
    };

    const value = {
        user,
        token,
        isLoading,
        register,
        login,
        logout,
        isAuthenticated,
        hasRole,
        isAdmin,
        isAffiliate,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};