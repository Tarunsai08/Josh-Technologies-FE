// Constants
const AUTOSCROLL_DELAY = 3000;
const ITEMS_PER_PAGE = 3;

const elements = {
    kitchenContainer: document.getElementById('kitchen-items'),
    cardContainer: document.getElementById('cardGroup'),
    prevButton: document.getElementById('prev'),
    backButton: document.getElementById('back'),
    video: document.getElementById('foodVideo'),
    playButton: document.getElementById('playButton'),
    cartIcon : document.querySelector('.cart-icon-button'),
    cartOverlay : document.getElementById('cartOverlay'),
    backToMenu : document.querySelector('.back-to-menu'),
    dishOpenOverlay : document.getElementById("dishOpenOverlay"),
    dishCloseOverlay : document.getElementById("dishCloseOverlay"),
    dishOverlay : document.getElementById("dishOverlay"),
};

let currentIndex = 0;
let items = [];
let autoScrollInterval;

// Kitchen Items Handler
const renderKitchenItem = (item) => {
    const foodItem = document.createElement('div');
    foodItem.classList.add('food-item');

    foodItem.innerHTML = `
        ${item.discount ? `<div class="discount">${item.discount}</div>` : ''}
        <img src="${item.image_url}" alt="${item.name}" class="item-image">
        <div class="item-details">
            <div>
                <div class="name">${item.name}</div>
                <div class="item-price">${item.price}</div>
            </div>
            <div>
                <div class="item-rating">
                    <span class="rating-stars">★ ${item.rating}</span> 
                    <span id="delivery-time">${item.delivery_time}</span>
                </div>
                ${item.add_button ? `
                    <a class="add-button" id="add-btn" aria-label="Add ${item.name} to cart">
                        <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="22" height="20" rx="5" fill="#F3BA00"/>
                            <path d="M11.5991 10.6961V16.1863M6.04956 10.6961H11.5991H6.04956ZM17.1487 10.6961H11.5991H17.1487ZM11.5991 10.6961V5.20588V10.6961Z" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    return foodItem;
};

const loadKitchenItems = async () => {
    try {
        const response = await fetch('../../data/kitchen_data.json');
        const data = await response.json();
        
        data.forEach(item => {
            const foodItem = renderKitchenItem(item);
            elements.kitchenContainer.appendChild(foodItem);
        });
    } catch (error) {
        console.error('Error loading kitchen items:', error);
        elements.kitchenContainer.innerHTML = '<p>Failed to load kitchen items. Please try again later.</p>';
    }
};

// Popular Items Carousel
const renderCarousel = () => {
    elements.cardContainer.innerHTML = '';

    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        const index = (currentIndex + i) % items.length;
        const item = items[index];
        const card = renderKitchenItem(item); 
        card.classList.add('card'); 
        elements.cardContainer.appendChild(card);
    }
};

const moveCarousel = (direction) => {
    currentIndex = (currentIndex + direction + items.length) % items.length;
    renderCarousel();
};

const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => moveCarousel(1), AUTOSCROLL_DELAY);
};

const stopAutoScroll = () => {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
};

const loadPopularItems = async () => {
    try {
        const response = await fetch('../../data/popular_items.json');
        items = await response.json();
        renderCarousel();
        startAutoScroll();
    } catch (error) {
        console.error('Error loading popular items:', error);
        elements.cardContainer.innerHTML = '<p>Failed to load popular items. Please try again later.</p>';
    }
};

const togglePlay = () => {
    if (elements.video.paused) {
        elements.video.play();
    } else {
        elements.video.pause();
    }
};

const updatePlayButton = () => {
    elements.playButton.style.display = elements.video.paused ? 'flex' : 'none';
};

const initializeEventListeners = () => {
    elements.prevButton.addEventListener('click', () => moveCarousel(-1));
    elements.backButton.addEventListener('click', () => moveCarousel(1));
    elements.cardContainer.addEventListener('mouseenter', stopAutoScroll);
    elements.cardContainer.addEventListener('mouseleave', startAutoScroll);

    elements.playButton.addEventListener('click', togglePlay);
    elements.video.addEventListener('click', togglePlay);
    elements.video.addEventListener('play', updatePlayButton);
    elements.video.addEventListener('pause', updatePlayButton);
    elements.video.addEventListener('ended', updatePlayButton);
};

const toggleCart = () => {
    elements.cartIcon.addEventListener('click', () => {
        elements.cartOverlay.classList.add('show');
        document.body.classList.add('overlay-open');
    });
    
    elements.backToMenu.addEventListener('click', () => {
        elements.cartOverlay.classList.remove('show');
        document.body.classList.remove('overlay-open');
    });
    
    elements.cartOverlay.addEventListener('click', (e) => {
        if (e.target === elements.cartOverlay) {
            elements.cartOverlay.classList.remove('show');
            document.body.classList.remove('overlay-open');
        }
    });
}

const toggleRequest = () => {
    elements.dishOpenOverlay.addEventListener('click', () => {
        elements.dishOverlay.classList.add('active');
        document.body.classList.add('overlay-open');
    });
    
    elements.dishCloseOverlay.addEventListener('click', () => {
        elements.dishOverlay.classList.remove('active');
        document.body.classList.remove('overlay-open');
    });
    
    elements.dishOverlay.addEventListener('click', (e) => {
        if (e.target === elements.dishOverlay) {
            elements.dishOverlay.classList.remove('active');
            document.body.classList.remove('overlay-open');
        }
    });
}

const initialize = () => {
    loadKitchenItems();
    loadPopularItems();
    initializeEventListeners();
    toggleCart();
    toggleRequest();
};

document.addEventListener('DOMContentLoaded', initialize);