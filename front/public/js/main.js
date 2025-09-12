const App = {
    config: {
        apiBaseUrl: '/api',
        csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    },
    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupNotifications();
        this.setupLoading();
        console.log('App initialized');
    },
    setupEventListeners() {
        document.querySelectorAll('.alert[data-auto-dismiss]').forEach(alert => {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });

        document.querySelectorAll('[data-confirm]').forEach(element => {
            element.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-confirm');
                if (!confirm(message)) {
                    e.preventDefault();
                    return false;
                }
            });
        });

        document.querySelectorAll('form[data-method]').forEach(form => {
            form.addEventListener('submit', (e) => {
                const method = form.getAttribute('data-method').toUpperCase();
                if (method !== 'POST') {
                    e.preventDefault();
                    this.submitFormWithMethod(form, method);
                }
            });
        });
    },

    setupFormValidation() {
        document.querySelectorAll('.needs-validation').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });

        document.querySelectorAll('.form-control[data-validate]').forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });
    },

    setupNotifications() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '1055';
            document.body.appendChild(container);
        }
    },

    setupLoading() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                this.showLoading();
            });
        });
    },

    async submitFormWithMethod(form, method) {
        try {
            this.showLoading();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch(form.action, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else {
                    this.showNotification('Операция выполнена успешно', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                }
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Произошла ошибка', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Произошла ошибка при отправке данных', 'error');
        } finally {
            this.hideLoading();
        }
    },

    validateField(input) {
        const type = input.getAttribute('data-validate');
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        switch (type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                message = 'Введите корректный email адрес';
                break;
            case 'username':
                isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
                message = 'Имя пользователя должно содержать минимум 3 символа (буквы, цифры, подчеркивание)';
                break;
            case 'password':
                isValid = value.length >= 6;
                message = 'Пароль должен содержать минимум 6 символов';
                break;
            case 'required':
                isValid = value.length > 0;
                message = 'Поле обязательно для заполнения';
                break;
        }

        this.setFieldValidation(input, isValid, message);
        return isValid;
    },

    setFieldValidation(input, isValid, message) {
        const feedback = input.parentNode.querySelector('.invalid-feedback') ||
                        input.parentNode.querySelector('.valid-feedback');
        
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (feedback) {
                feedback.textContent = '';
                feedback.classList.remove('invalid-feedback');
                feedback.classList.add('valid-feedback');
            }
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            if (feedback) {
                feedback.textContent = message;
                feedback.classList.remove('valid-feedback');
                feedback.classList.add('invalid-feedback');
            } else {
                const newFeedback = document.createElement('div');
                newFeedback.className = 'invalid-feedback';
                newFeedback.textContent = message;
                input.parentNode.appendChild(newFeedback);
            }
        }
    },

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const typeClasses = {
            success: 'bg-success text-white',
            error: 'bg-danger text-white',
            warning: 'bg-warning text-dark',
            info: 'bg-info text-white'
        };

        const icons = {
            success: 'bi-check-circle',
            error: 'bi-exclamation-triangle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle'
        };

        const toastHTML = `
            <div id="${toastId}" class="toast ${typeClasses[type] || typeClasses.info}" role="alert" data-bs-autohide="true" data-bs-delay="${duration}">
                <div class="toast-header ${typeClasses[type] || typeClasses.info}">
                    <i class="bi ${icons[type] || icons.info} me-2"></i>
                    <strong class="me-auto">Уведомление</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    showLoading() {
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'spinner-overlay';
            overlay.innerHTML = `
                <div class="spinner-border spinner-border-lg text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    },

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    api: {
        async request(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            const config = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            };

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                
                return await response.text();
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        },

        get(url) {
            return this.request(url, { method: 'GET' });
        },

        post(url, data) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        put(url, data) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        delete(url) {
            return this.request(url, { method: 'DELETE' });
        }
    },

    utils: {
        formatDate(date, locale = 'ru-RU') {
            return new Date(date).toLocaleDateString(locale);
        },
        formatDateTime(date, locale = 'ru-RU') {
            return new Date(date).toLocaleString(locale);
        },
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        getUrlParams() {
            return new URLSearchParams(window.location.search);
        },
        isMobile() {
            return window.innerWidth <= 768;
        }
    }
};
const UserManager = {
    async deleteUser(userId, username) {
        if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
            return;
        }

        try {
            App.showLoading();
            await App.api.delete(`/users/${userId}`);
            App.showNotification('Пользователь успешно удален', 'success');

            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            if (row) {
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.remove();
                    this.updateUserCount();
                }, 500);
            }
        } catch (error) {
            console.error('Delete user error:', error);
            App.showNotification('Ошибка при удалении пользователя', 'error');
        } finally {
            App.hideLoading();
        }
    },

    updateUserCount() {
        const rows = document.querySelectorAll('tbody tr[data-user-id]');
        const countElement = document.getElementById('user-count');
        if (countElement) {
            countElement.textContent = rows.length;
        }

        if (rows.length === 0) {
            const tbody = document.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="text-muted">
                                <i class="bi bi-people icon-xl"></i>
                                <p class="mt-2">Пользователи не найдены</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    },

    setupUserSearch() {
        const searchInput = document.getElementById('user-search');
        if (!searchInput) return;

        const debouncedSearch = App.utils.debounce((query) => {
            this.filterUsers(query);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });
    },

    filterUsers(query) {
        const rows = document.querySelectorAll('tbody tr[data-user-id]');
        let visibleCount = 0;

        rows.forEach(row => {
            const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const fullName = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            
            const searchText = query.toLowerCase();
            const isVisible = username.includes(searchText) || 
                            email.includes(searchText) || 
                            fullName.includes(searchText);

            if (isVisible) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        const resultCount = document.getElementById('search-result-count');
        if (resultCount) {
            if (query) {
                resultCount.textContent = `Найдено: ${visibleCount}`;
                resultCount.style.display = 'block';
            } else {
                resultCount.style.display = 'none';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();

    if (document.querySelector('.users-page')) {
        UserManager.setupUserSearch();
    }
});

window.deleteUser = UserManager.deleteUser.bind(UserManager);
window.App = App;
