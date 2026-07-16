const API_BASE_URL = 'https://expense.onrender.com/api';

async function getUsers() {
    return fetch(API_BASE_URL + '/users').then(r => r.json());
}

async function getTransactions(filters) {
    let url = API_BASE_URL + '/transactions';
    if (filters) {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        url += '?' + params.toString();
    }
    return fetch(url).then(r => r.json());
}

async function addTransactionAPI(data) {
    return fetch(API_BASE_URL + '/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

async function getStatistics(userId) {
    let url = API_BASE_URL + '/statistics';
    if (userId) url += '?user_id=' + userId;
    return fetch(url).then(r => r.json());
}

async function getCategories() {
    return fetch(API_BASE_URL + '/categories').then(r => r.json());
}

async function addCategoryAPI(type, name) {
    return fetch(API_BASE_URL + '/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name })
    }).then(r => r.json());
}
