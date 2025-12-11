class Slider {
    constructor() {
        this.currentPhoto = document.getElementById('currentPhoto');
        this.photoCounter = document.getElementById('photoCounter');
        this.photoTitle = document.getElementById('photoTitle');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // Элементы галереи
        this.toggleGalleryBtn = document.getElementById('toggleGalleryBtn');
        this.galleryModal = document.getElementById('galleryModal');
        this.closeGalleryBtn = document.getElementById('closeGalleryBtn');
        this.galleryGrid = document.getElementById('galleryGrid');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
        this.viewAsSlideshowBtn = document.getElementById('viewAsSlideshowBtn');
        
        // Элементы слайд-шоу
        this.slideshowModal = document.getElementById('slideshowModal');
        this.closeSlideshowBtn = document.getElementById('closeSlideshowBtn');
        this.slideshowImage = document.getElementById('slideshowImage');
        this.slideshowCounter = document.getElementById('slideshowCounter');
        this.prevSlideshowBtn = document.getElementById('prevSlideshowBtn');
        this.nextSlideshowBtn = document.getElementById('nextSlideshowBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.slideshowSpeed = document.getElementById('slideshowSpeed');
        
        this.totalPhotos = 30;
        this.photos = this.generatePhotoList();
        this.currentIndex = 0;
        
        // Состояние галереи
        this.selectedPhotos = new Set();
        this.isSlideshowPlaying = false;
        this.slideshowInterval = null;
        this.currentSlideshowIndex = 0;
        
        this.init();
    }
    
    generatePhotoList() {
        const photos = [];
        for (let i = 1; i <= this.totalPhotos; i++) {
            photos.push({
                url: `src/${i}.jpg`,
                title: `Прекрасные котики ${i}`,
                filename: `фото_${i}.jpg`,
                id: i
            });
        }
        return photos;
    }
    
    init() {
        // Проверяем существование элементов перед добавлением обработчиков
        if (!this.currentPhoto) {
            console.error('Элемент currentPhoto не найден');
            return;
        }
        
        // Основные кнопки слайдера
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPhoto());
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevPhoto());
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadCurrentPhoto());
        }
        
        // Кнопка галереи
        if (this.toggleGalleryBtn) {
            this.toggleGalleryBtn.addEventListener('click', () => this.openGallery());
        }
        
        // Галерея
        if (this.closeGalleryBtn) {
            this.closeGalleryBtn.addEventListener('click', () => this.closeGallery());
        }
        
        if (this.selectAllBtn) {
            this.selectAllBtn.addEventListener('click', () => this.selectAllPhotos());
        }
        
        if (this.deselectAllBtn) {
            this.deselectAllBtn.addEventListener('click', () => this.deselectAllPhotos());
        }
        
        if (this.downloadSelectedBtn) {
            this.downloadSelectedBtn.addEventListener('click', () => this.downloadSelectedPhotos());
        }
        
        if (this.viewAsSlideshowBtn) {
            this.viewAsSlideshowBtn.addEventListener('click', () => this.openSlideshow());
        }
        
        // Слайд-шоу
        if (this.closeSlideshowBtn) {
            this.closeSlideshowBtn.addEventListener('click', () => this.closeSlideshow());
        }
        
        if (this.prevSlideshowBtn) {
            this.prevSlideshowBtn.addEventListener('click', () => this.prevSlideshow());
        }
        
        if (this.nextSlideshowBtn) {
            this.nextSlideshowBtn.addEventListener('click', () => this.nextSlideshow());
        }
        
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.toggleSlideshow());
        }
        
        if (this.slideshowSpeed) {
            this.slideshowSpeed.addEventListener('change', () => this.updateSlideshowSpeed());
        }
        
        // Закрытие модальных окон по клику вне области
        document.addEventListener('click', (e) => {
            if (this.galleryModal && e.target === this.galleryModal) {
                this.closeGallery();
            }
            if (this.slideshowModal && e.target === this.slideshowModal) {
                this.closeSlideshow();
            }
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextPhoto();
            if (e.key === 'ArrowLeft') this.prevPhoto();
            
            // Ctrl+D для скачивания
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.downloadCurrentPhoto();
            }
            
            // G для открытия галереи
            if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                this.openGallery();
            }
            
            // ESC для закрытия модальных окон
            if (e.key === 'Escape') {
                if (this.galleryModal && this.galleryModal.classList.contains('active')) {
                    this.closeGallery();
                }
                if (this.slideshowModal && this.slideshowModal.classList.contains('active')) {
                    this.closeSlideshow();
                }
            }
        });
        
        this.updatePhotoInfo();
        this.loadGallery();
        
        // Проверяем загрузку начального изображения
        this.checkImageLoad(this.currentPhoto);
    }
    
    checkImageLoad(imgElement) {
        if (!imgElement) return;
        
        imgElement.onload = () => {
            console.log(`Изображение загружено: ${imgElement.src}`);
        };
        
        imgElement.onerror = () => {
            console.error(`Ошибка загрузки изображения: ${imgElement.src}`);
            // Показываем заглушку вместо сломанного изображения
            imgElement.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999">Изображение не найдено</text></svg>';
            imgElement.alt = 'Изображение не найдено';
        };
    }
    
    // Основные методы слайдера
    prevPhoto() {
        this.animateButton(this.prevBtn);
        this.animatePhotoChange(-1);
    }
    
    nextPhoto() {
        this.animateButton(this.nextBtn);
        this.animatePhotoChange(1);
    }
    
    async downloadCurrentPhoto() {
        if (!this.downloadBtn) return;
        
        this.animateButton(this.downloadBtn);
        
        const currentPhoto = this.photos[this.currentIndex];
        await this.downloadPhoto(currentPhoto);
    }
    
    // Методы галереи
    openGallery() {
        if (!this.galleryModal) return;
        
        this.galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateGallerySelection();
    }
    
    closeGallery() {
        if (!this.galleryModal) return;
        
        this.galleryModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    loadGallery() {
        if (!this.galleryGrid) return;
        
        this.galleryGrid.innerHTML = '';
        
        this.photos.forEach((photo, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = photo.id;
            galleryItem.dataset.index = index;
            
            galleryItem.innerHTML = `
                <div class="gallery-item-inner">
                    <div class="gallery-item-select">
                        <input type="checkbox" id="photo_${photo.id}" class="photo-checkbox">
                        <label for="photo_${photo.id}"></label>
                    </div>
                    <img src="${photo.url}" alt="${photo.title}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"150\" viewBox=\"0 0 200 150\"><rect width=\"200\" height=\"150\" fill=\"%23f0f0f0\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"14\" fill=\"%23999\">Фото ${index + 1}</text></svg>'">
                    <div class="gallery-item-info">
                        <span class="gallery-item-title">${photo.title}</span>
                        <span class="gallery-item-number">Фото ${index + 1}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button class="gallery-view-btn" data-index="${index}">
                            <span class="view-icon">👁️</span>
                            Посмотреть
                        </button>
                        <button class="gallery-download-btn" data-index="${index}">
                            <span class="download-icon">↓</span>
                            Скачать
                        </button>
                    </div>
                </div>
            `;
            
            // Добавляем обработчики событий
            const checkbox = galleryItem.querySelector('.photo-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedPhotos.add(photo.id);
                    } else {
                        this.selectedPhotos.delete(photo.id);
                    }
                    this.updateGallerySelection();
                });
            }
            
            const viewBtn = galleryItem.querySelector('.gallery-view-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    this.currentIndex = index;
                    this.updatePhoto();
                    this.closeGallery();
                });
            }
            
            const downloadBtn = galleryItem.querySelector('.gallery-download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', async () => {
                    await this.downloadPhoto(photo);
                });
            }
            
            this.galleryGrid.appendChild(galleryItem);
        });
    }
    
    selectAllPhotos() {
        this.selectedPhotos.clear();
        this.photos.forEach(photo => {
            this.selectedPhotos.add(photo.id);
        });
        this.updateGallerySelection();
    }
    
    deselectAllPhotos() {
        this.selectedPhotos.clear();
        this.updateGallerySelection();
    }
    
    updateGallerySelection() {
        // Обновляем чекбоксы
        const checkboxes = document.querySelectorAll('.photo-checkbox');
        checkboxes.forEach(checkbox => {
            const photoId = parseInt(checkbox.id.replace('photo_', ''));
            checkbox.checked = this.selectedPhotos.has(photoId);
        });
        
        // Обновляем кнопку скачивания выбранных
        if (this.downloadSelectedBtn) {
            const count = this.selectedPhotos.size;
            this.downloadSelectedBtn.disabled = count === 0;
            this.downloadSelectedBtn.innerHTML = `
                <span class="action-icon">📥</span>
                Скачать выбранные (${count})
            `;
        }
    }
    
    async downloadSelectedPhotos() {
        if (this.selectedPhotos.size === 0) return;
        
        this.animateButton(this.downloadSelectedBtn);
        
        // Показываем прогресс
        const progressModal = this.createProgressModal('Скачивание фотографий...');
        
        try {
            let downloaded = 0;
            const total = this.selectedPhotos.size;
            
            for (const photoId of this.selectedPhotos) {
                const photo = this.photos.find(p => p.id === photoId);
                if (photo) {
                    await this.downloadPhoto(photo);
                    downloaded++;
                    
                    // Обновляем прогресс
                    this.updateProgressModal(progressModal, downloaded, total);
                }
            }
            
            // Показываем сообщение об успехе
            this.showMessage(`Скачано ${downloaded} фотографий!`, 'success');
            
        } catch (error) {
            console.error('Ошибка при скачивании фотографий:', error);
            this.showMessage(`Ошибка скачивания: ${error.message}`, 'error');
            
        } finally {
            // Закрываем прогресс
            setTimeout(() => {
                if (progressModal.parentNode) {
                    progressModal.remove();
                }
            }, 2000);
        }
    }
    
    // Методы слайд-шоу
    openSlideshow() {
        if (!this.slideshowModal || !this.slideshowImage) return;
        
        this.currentSlideshowIndex = 0;
        this.isSlideshowPlaying = true;
        this.slideshowModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateSlideshow();
        this.startSlideshow();
    }
    
    closeSlideshow() {
        if (!this.slideshowModal) return;
        
        this.slideshowModal.classList.remove('active');
        document.body.style.overflow = '';
        this.stopSlideshow();
    }
    
    updateSlideshow() {
        if (!this.slideshowImage) return;
        
        const photo = this.photos[this.currentSlideshowIndex];
        this.slideshowImage.src = photo.url;
        this.slideshowImage.alt = photo.title;
        
        // Проверяем загрузку изображения для слайд-шоу
        this.checkImageLoad(this.slideshowImage);
        
        if (this.slideshowCounter) {
            this.slideshowCounter.textContent = `${this.currentSlideshowIndex + 1} / ${this.photos.length}`;
        }
    }
    
    prevSlideshow() {
        this.currentSlideshowIndex = (this.currentSlideshowIndex - 1 + this.photos.length) % this.photos.length;
        this.updateSlideshow();
    }
    
    nextSlideshow() {
        this.currentSlideshowIndex = (this.currentSlideshowIndex + 1) % this.photos.length;
        this.updateSlideshow();
    }
    
    toggleSlideshow() {
        if (!this.playPauseBtn) return;
        
        this.isSlideshowPlaying = !this.isSlideshowPlaying;
        if (this.isSlideshowPlaying) {
            this.startSlideshow();
            this.playPauseBtn.innerHTML = '<span class="play-icon">⏸️</span> Пауза';
        } else {
            this.stopSlideshow();
            this.playPauseBtn.innerHTML = '<span class="play-icon">▶️</span> Играть';
        }
    }
    
    startSlideshow() {
        this.stopSlideshow();
        if (!this.slideshowSpeed) return;
        
        const speed = parseInt(this.slideshowSpeed.value);
        this.slideshowInterval = setInterval(() => {
            this.nextSlideshow();
        }, speed);
    }
    
    stopSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }
    
    updateSlideshowSpeed() {
        if (this.isSlideshowPlaying) {
            this.startSlideshow();
        }
    }
    
    // Вспомогательные методы
    async downloadPhoto(photo) {
        try {
            // Показываем состояние загрузки
            this.showMessage(`Скачивание ${photo.filename}...`, 'info');
            
            const response = await fetch(photo.url);
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = photo.filename;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(downloadUrl);
            
            this.showMessage(`${photo.filename} скачан успешно!`, 'success');
            
        } catch (error) {
            console.error('Ошибка при скачивании фото:', error);
            this.showMessage(`Ошибка скачивания: ${error.message}`, 'error');
        }
    }
    
    createProgressModal(title) {
        const modal = document.createElement('div');
        modal.className = 'progress-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10001;
            min-width: 300px;
            text-align: center;
        `;
        
        modal.innerHTML = `
            <h4>${title}</h4>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    updateProgressModal(modal, current, total) {
        const percent = Math.round((current / total) * 100);
        const progressBar = modal.querySelector('.progress-bar');
        const progressText = modal.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `${percent}% (${current}/${total})`;
        }
    }
    
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 3s forwards;
        `;
        
        if (type === 'success') {
            message.style.background = '#4CAF50';
        } else if (type === 'error') {
            message.style.background = '#f44336';
        } else {
            message.style.background = '#2196F3';
        }
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3500);
    }
    
    animateButton(button) {
        if (!button || button.disabled) return;
        
        button.classList.add('btn-click');
        setTimeout(() => {
            button.classList.remove('btn-click');
        }, 200);
    }
    
    animatePhotoChange(direction) {
        if (!this.currentPhoto) return;
        
        this.currentPhoto.classList.add('fade-out');
        
        setTimeout(() => {
            this.currentIndex = direction === 1 ? 
                (this.currentIndex + 1) % this.photos.length :
                (this.currentIndex - 1 + this.photos.length) % this.photos.length;
            
            this.updatePhoto();
            
            this.currentPhoto.classList.remove('fade-out');
            this.currentPhoto.classList.add('fade-in');
            
            setTimeout(() => {
                this.currentPhoto.classList.remove('fade-in');
            }, 500);
            
        }, 500);
    }
    
    updatePhoto() {
        if (!this.currentPhoto) return;
        
        const photo = this.photos[this.currentIndex];
        this.currentPhoto.src = photo.url;
        this.currentPhoto.alt = `Фотография ${this.currentIndex + 1}`;
        
        // Проверяем загрузку нового изображения
        this.checkImageLoad(this.currentPhoto);
        
        this.updatePhotoInfo();
    }
    
    updatePhotoInfo() {
        if (this.photoCounter) {
            this.photoCounter.textContent = `Фото ${this.currentIndex + 1} из ${this.photos.length}`;
        }
        
        if (this.photoTitle) {
            this.photoTitle.textContent = this.photos[this.currentIndex].title;
        }
    }
}

if (document.getElementById('currentPhoto')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.slider = new Slider();
    });
} else {
    console.warn('Слайдер не инициализирован: элемент currentPhoto не найден');
}