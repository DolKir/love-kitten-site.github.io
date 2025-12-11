class AppInitializer {
    constructor() {
        this.initComponents();
        this.addGlobalEventListeners();
    }
    
    initComponents() {
        console.log('Приложение инициализировано');
        
        // Проверяем наличие всех необходимых изображений
        this.checkAllImages();
    }
    
    addGlobalEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+R для обновления курсов валют
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                if (window.currencyService) {
                    window.currencyService.fetchCurrencyRates();
                }
            }
            
            // Ctrl+S для сохранения текущего фото (альтернатива Ctrl+D)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (window.slider && window.slider.downloadCurrentPhoto) {
                    window.slider.downloadCurrentPhoto();
                }
            }
        });
        
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    }
    
    checkAllImages() {
        // Исправлено: убрана функция из цикла
        const checkImage = (i) => {
            const img = new Image();
            img.src = `src/${i}.jpg`;
            
            img.onload = () => {
                console.log(`✓ Фото ${i}.jpg найдено`);
            };
            
            img.onerror = () => {
                console.warn(`✗ Фото ${i}.jpg не найдено в папке src/`);
            };
        };
        
        // Проверяем существование изображений в папке src
        for (let i = 1; i <= 8; i++) {
            checkImage(i);
        }
    }
}

class Formatter {
    static formatCurrency(value, currency = 'RUB') {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency
        }).format(value);
    }
    
    static formatDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppInitializer();
    window.Formatter = Formatter;
    
    // Добавляем обработчик для изображений с ошибками
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            console.error(`Ошибка загрузки изображения: ${e.target.src}`);
            
            // Заменяем сломанное изображение на заглушку
            if (!e.target.src.includes('data:image/svg+xml')) {
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999">Изображение не найдено</text></svg>';
                e.target.alt = 'Изображение не найдено';
            }
        }
    }, true);
});