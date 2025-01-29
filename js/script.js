// Config
const CONFIG = {
    carousel: {
      autoScrollDelay: 3000,
      itemsPerPage: 3
    },
    endpoints: {
      kitchenData: '../data/kitchen_data.json',
      popularItems: '../data/popular_items.json'
    }
  };
  
  // DOM Selectors using data attributes for better maintainability
  const SELECTORS = {
    kitchen: '#kitchen-items',  
    carousel: '#cardGroup',     
    navigation: {
      prev: '#prev',          
      next: '#next'         
    },
    video: {
      player: '#foodVideo',    
      playButton: '#playButton' 
    },
    cart: {
      button: '.header__cart-icon', 
      overlay: '#cartOverlay',     
      closeButton: '.header__back-btn' 
    },
    dish: {
      openButton: '#dishOpenOverlay',  
      closeButton: '#dishCloseOverlay', 
      overlay: '#dishOverlay'          
    }
  };
  
  class RestaurantApp {
    constructor() {
      this.state = {
        currentIndex: 0,
        carouselItems: [],
        autoScrollInterval: null
      };
      
      this.elements = this.initializeElements();
      this.bindEvents();
    }
  
    initializeElements() {
      return {
        kitchen: document.querySelector(SELECTORS.kitchen),
        carousel: {
          container: document.querySelector(SELECTORS.carousel),
          prevButton: document.querySelector(SELECTORS.navigation.prev),
          nextButton: document.querySelector(SELECTORS.navigation.next)
        },
        video: {
          player: document.querySelector(SELECTORS.video.player),
          playButton: document.querySelector(SELECTORS.video.playButton)
        },
        cart: {
          button: document.querySelector(SELECTORS.cart.button),
          overlay: document.querySelector(SELECTORS.cart.overlay),
          closeButton: document.querySelector(SELECTORS.cart.closeButton)
        },
        dish: {
          openButton: document.querySelector(SELECTORS.dish.openButton),
          closeButton: document.querySelector(SELECTORS.dish.closeButton),
          overlay: document.querySelector(SELECTORS.dish.overlay)
        }
      };
    }
  
    async initialize() {
      try {
        await Promise.all([
          this.loadKitchenItems(),
          this.loadPopularItems()
        ]);
        this.startAutoScroll();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    }
  
    // Kitchen Items
    async loadKitchenItems() {
      try {
        const response = await fetch(CONFIG.endpoints.kitchenData);
        const data = await this.handleResponse(response);
        this.renderKitchenItems(data);
      } catch (error) {
        this.handleError('kitchen items', error);
      }
    }
  
    renderKitchenItems(items) {
      const fragment = document.createDocumentFragment();
      items.forEach(item => {
        fragment.appendChild(this.createFoodItemElement(item));
      });
      this.elements.kitchen.appendChild(fragment);
    }
  
    createFoodItemElement(item) {
      const element = document.createElement('div');
      element.className = 'food-item';
      element.innerHTML = this.getFoodItemTemplate(item);
      return element;
    }
  
    getFoodItemTemplate(item) {
      return `
        ${item.discount ? `<div class="discount">${item.discount}</div>` : ''}
        <img src="${item.image_url}" alt="${item.name}" class="item-image" loading="lazy">
        <div class="item-details">
          <div>
            <div class="name">${this.sanitizeHTML(item.name)}</div>
            <div class="item-price">${this.formatPrice(item.price)}</div>
          </div>
          <div>
            <div class="item-rating">
                    <span class="rating-stars">★ ${item.rating}</span> 
                    <span id="delivery-time">${item.delivery_time}</span>
                </div>
            ${this.getAddButtonTemplate(item)}
          </div>
        </div>
      `;
    }
  
    getAddButtonTemplate(item) {
      return item.add_button ? `
        <a class="add-button" id="add-btn" aria-label="Add ${this.sanitizeHTML(item.name)} to cart">
          <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="22" height="20" rx="5" fill="#F3BA00"/>
            <path d="M11.5991 10.6961V16.1863M6.04956 10.6961H11.5991H6.04956ZM17.1487 10.6961H11.5991H17.1487ZM11.5991 10.6961V5.20588V10.6961Z" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      ` : '';
    }
  
    // Carousel
    async loadPopularItems() {
      try {
        const response = await fetch(CONFIG.endpoints.popularItems);
        console.log(response);
        this.state.carouselItems = await this.handleResponse(response);
        this.renderCarousel();
      } catch (error) {
        this.handleError('popular items', error);
      }
    }
  
    renderCarousel() {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < CONFIG.carousel.itemsPerPage; i++) {
        const index = (this.state.currentIndex + i) % this.state.carouselItems.length;
        const item = this.state.carouselItems[index];
        const element = this.createFoodItemElement(item);
        element.classList.add('card');
        fragment.appendChild(element);
      }
      this.elements.carousel.container.innerHTML = '';
      this.elements.carousel.container.appendChild(fragment);
    }
  
    moveCarousel(direction) {
      this.state.currentIndex = (
        this.state.currentIndex + direction + this.state.carouselItems.length
      ) % this.state.carouselItems.length;
      this.renderCarousel();
    }
  
    startAutoScroll() {
      this.stopAutoScroll();
      this.state.autoScrollInterval = setInterval(
        () => this.moveCarousel(1),
        CONFIG.carousel.autoScrollDelay
      );
    }
  
    stopAutoScroll() {
      if (this.state.autoScrollInterval) {
        clearInterval(this.state.autoScrollInterval);
      }
    }
  
    // Video Player
    handleVideo() {
      const { player, playButton } = this.elements.video;
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }
  
    updatePlayButton() {
      this.elements.video.playButton.style.display = 
        this.elements.video.player.paused ? 'flex' : 'none';
    }
  
    // Modal Handlers
    toggleModal(overlay, isOpen) {
      overlay.classList.toggle('show', isOpen);
      document.body.classList.toggle('overlay-open', isOpen);
    }
  
    // Event Bindings
    bindEvents() {
        console.log(this.elements);
      // Carousel Events
      this.elements.carousel.prevButton.addEventListener('click', () => this.moveCarousel(-1));
      this.elements.carousel.nextButton.addEventListener('click', () => this.moveCarousel(1));
      this.elements.carousel.container.addEventListener('mouseenter', () => this.stopAutoScroll());
      this.elements.carousel.container.addEventListener('mouseleave', () => this.startAutoScroll());
  
      // Video Events
      const { player, playButton } = this.elements.video;
      playButton.addEventListener('click', () => this.handleVideo());
      player.addEventListener('click', () => this.handleVideo());
      ['play', 'pause', 'ended'].forEach(event => {
        player.addEventListener(event, () => this.updatePlayButton());
      });
  
      // Cart Events
      this.bindModalEvents(
        this.elements.cart.button,
        this.elements.cart.closeButton,
        this.elements.cart.overlay
      );
  
      // Dish Request Events
      this.bindModalEvents(
        this.elements.dish.openButton,
        this.elements.dish.closeButton,
        this.elements.dish.overlay
      );
    }
  
    bindModalEvents(openButton, closeButton, overlay) {
      openButton.addEventListener('click', () => this.toggleModal(overlay, true));
      closeButton.addEventListener('click', () => this.toggleModal(overlay, false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.toggleModal(overlay, false);
        }
      });
    }
  
    // Utility Methods
    async handleResponse(response) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
  
    handleError(component, error) {
      console.error(`Error loading ${component}:`, error);
      // You could implement more sophisticated error handling here
    }
  
    sanitizeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  
    formatPrice(price) {
      return typeof price === 'number' 
        ? `$${price.toFixed(2)}` 
        : price;
    }
  }
  
  // Initialize the app when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const app = new RestaurantApp();
    app.initialize();
  });