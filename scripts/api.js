class CurrencyService {
    constructor() {
        this.currencyDataElement = document.getElementById('currencyData');
        this.refreshBtn = document.getElementById('refreshRates');
        this.lastUpdateElement = document.getElementById('lastUpdate');
        
        this.baseUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';
        
        // Только эти 5 валют
        this.selectedCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'KZT'];
        
        this.currencyNames = {
            'USD': 'Доллар США',
            'EUR': 'Евро',
            'GBP': 'Фунт стерлингов',
            'CNY': 'Китайский юань',
            'KZT': 'Казахстанский тенге'
        };
        
        this.init();
    }
    
    init() {
        this.fetchCurrencyRates();
        
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.fetchCurrencyRates());
        }
        
        setInterval(() => this.fetchCurrencyRates(), 10 * 60 * 1000);
    }
    
    async fetchCurrencyRates() {
        try {
            this.showLoading();
            
            const timestamp = new Date().getTime();
            const url = `${this.baseUrl}?t=${timestamp}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCurrencyRates(data);
            
        } catch (error) {
            console.error('Ошибка при загрузке курсов валют:', error);
            this.displayError(error);
        }
    }
    
    displayCurrencyRates(data) {
        if (!data || !data.Valute) {
            this.currencyDataElement.innerHTML = '<div class="error">Данные о валютах не получены</div>';
            return;
        }
        
        const date = new Date(data.Date);
        const dateString = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        this.updateLastUpdateTime(date);
        
        // Получаем только выбранные валюты
        const selectedCurrenciesData = [];
        
        this.selectedCurrencies.forEach(code => {
            if (data.Valute[code]) {
                selectedCurrenciesData.push(data.Valute[code]);
            }
        });
        
        // Если какие-то валюты не найдены, показываем сообщение
        if (selectedCurrenciesData.length === 0) {
            this.currencyDataElement.innerHTML = '<div class="error">Не удалось загрузить курсы выбранных валют</div>';
            return;
        }
        
        const currencyHTML = `
            <div class="currency-info">
                <div class="currency-date">Курсы валют на ${dateString}</div>
                <div class="currency-notice">Официальные курсы ЦБ РФ</div>
                <div class="currency-count">Отображается: ${selectedCurrenciesData.length} валют</div>
            </div>
            <div class="currency-grid">
                ${selectedCurrenciesData.map(currency => this.createCurrencyCard(currency)).join('')}
            </div>
        `;
        
        this.currencyDataElement.innerHTML = currencyHTML;
    }
    
    createCurrencyCard(currency) {
        const change = currency.Value - currency.Previous;
        const changePercent = ((change / currency.Previous) * 100).toFixed(2);
        const isPositive = change >= 0;
        const currencyName = this.currencyNames[currency.CharCode] || currency.Name;
        
        return `
            <div class="currency-card ${currency.CharCode}">
                <div class="currency-header">
                    <div class="currency-code-wrapper">
                        <span class="currency-code">${currency.CharCode}</span>
                        <span class="currency-numcode">${currency.NumCode}</span>
                    </div>
                    <span class="currency-name" title="${currencyName}">${currencyName}</span>
                </div>
                <div class="currency-rate">
                    <div class="rate-main">
                        <span class="rate-value">${currency.Value.toFixed(2)}</span>
                        <span class="rate-currency">₽</span>
                    </div>
                    <div class="currency-change ${isPositive ? 'positive' : 'negative'}">
                        <span class="change-icon">${isPositive ? '📈' : '📉'}</span>
                        <div class="change-details">
                            <span class="change-value">${change >= 0 ? '+' : ''}${change.toFixed(2)}</span>
                            <span class="change-percent">${change >= 0 ? '+' : ''}${changePercent}%</span>
                        </div>
                    </div>
                </div>
                <div class="currency-details">
                    <div class="detail-item">
                        <span class="detail-label">Предыдущий:</span>
                        <span class="detail-value">${currency.Previous.toFixed(2)} ₽</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Номинал:</span>
                        <span class="detail-value">${currency.Nominal}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    displayError(error) {
        this.currencyDataElement.innerHTML = `
            <div class="error-message">
                <h4>⚠️ Ошибка загрузки курсов валют</h4>
                <p>Не удалось получить данные с сервера Центробанка РФ.</p>
                <p><em>Причина:</em> ${error.message}</p>
                <div class="error-solutions">
                    <h5>Возможные решения:</h5>
                    <ul>
                        <li>Проверьте подключение к интернету</li>
                        <li>Попробуйте обновить страницу</li>
                        <li>Попробуйте позже (сервер ЦБ может быть временно недоступен)</li>
                    </ul>
                </div>
                <button onclick="currencyService.fetchCurrencyRates()" class="retry-btn">
                    <span class="retry-icon">🔄</span> Повторить попытку
                </button>
            </div>
        `;
        
        if (this.lastUpdateElement) {
            this.lastUpdateElement.textContent = 'Ошибка загрузки данных';
        }
        
        if (this.refreshBtn) {
            this.refreshBtn.disabled = false;
            this.refreshBtn.innerHTML = '<span class="refresh-icon">↻</span> Повторить';
        }
    }
    
    showLoading() {
        this.currencyDataElement.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка официальных курсов валют ЦБ РФ...</p>
                <p class="loading-note">Данные загружаются с сервера Центробанка России</p>
            </div>
        `;
        
        if (this.refreshBtn) {
            this.refreshBtn.disabled = true;
            this.refreshBtn.innerHTML = '<span class="refresh-icon">⏳</span> Загрузка...';
        }
        
        if (this.lastUpdateElement) {
            this.lastUpdateElement.textContent = 'Идет загрузка данных...';
        }
    }
    
    updateLastUpdateTime(date) {
        const now = date || new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const dateString = now.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
        
        if (this.lastUpdateElement) {
            this.lastUpdateElement.innerHTML = `
                <span class="update-time">${timeString}</span>
                <span class="update-date">${dateString}</span>
            `;
        }
        
        if (this.refreshBtn) {
            this.refreshBtn.disabled = false;
            this.refreshBtn.innerHTML = '<span class="refresh-icon">↻</span> Обновить курсы';
        }
    }
}

if (document.getElementById('currencyData')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.currencyService = new CurrencyService();
    });
}