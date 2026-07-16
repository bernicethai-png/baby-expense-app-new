/**
 * API 调用库
 * 用于与后端服务器通信
 */

// 后端服务器地址
const API_BASE_URL = 'https://baby-expense-app-new-1.onrender.com/api';
// ==================== 用户相关 ====================

/**
 * 获取所有用户
 */
async function getUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return [];
    }
}

// ==================== 交易相关 ====================

/**
 * 添加交易记录
 */
async function addTransaction(transactionData) {
    try {
        console.log('发送请求到:', `${API_BASE_URL}/transactions`);
        console.log('数据:', transactionData);

        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });

        console.log('响应状态:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('错误响应:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('响应数据:', result);
        return result;
    } catch (error) {
        console.error('添加交易记录失败:', error);

        if (error.message.includes('Failed to fetch')) {
            return {
                success: false,
                error: '无法连接到服务器。请确保后端服务器正在运行 (python app.py)'
            };
        }

        return { success: false, error: error.message };
    }
}

/**
 * 获取交易记录
 * @param {Object} filters - 筛选条件 {user_id, type, date}
 */
async function getTransactions(filters = {}) {
    try {
        let url = `${API_BASE_URL}/transactions`;

        // 构建查询参数
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.type) params.append('type', filters.type);
        if (filters.date) params.append('date', filters.date);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const transactions = await response.json();
        return transactions;
    } catch (error) {
        console.error('获取交易记录失败:', error);
        return [];
    }
}

/**
 * 编辑交易记录
 */
async function updateTransaction(transactionId, updateData) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('编辑交易记录失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 删除交易记录
 */
async function deleteTransaction(transactionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('删除交易记录失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 统计相关 ====================

/**
 * 获取本月统计数据
 * @param {number} userId - 可选：用户ID，如果提供则只获取该用户的数据
 */
async function getStatistics(userId = null) {
    try {
        let url = `${API_BASE_URL}/statistics`;

        if (userId) {
            url += `?user_id=${userId}`;
        }

        const response = await fetch(url);
        const stats = await response.json();
        return stats;
    } catch (error) {
        console.error('获取统计数据失败:', error);
        return null;
    }
}

// ==================== 分类相关 ====================

/**
 * 获取所有分类
 */
async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('获取分类失败:', error);
        return [];
    }
}

/**
 * 添加新分类
 */
async function addCategory(type, name) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: type,
                name: name
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('添加分类失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 健康检查 ====================

/**
 * 检查服务器是否运行
 */
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const result = await response.json();
        console.log('服务器状态:', result.status);
        return result.status === 'ok';
    } catch (error) {
        console.error('无法连接到服务器:', error);
        return false;
    }
}
