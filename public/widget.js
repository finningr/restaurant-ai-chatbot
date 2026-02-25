/**
 * Restaurant AI Chatbot Widget
 * Embeddable script for websites
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_CONFIG = {
    baseUrl: 'https://restaurant-ai-chatbot.vercel.app', // Production URL
    defaultWidth: 350,
    defaultHeight: 600,
    mobileWidth: '100vw',
    mobileHeight: '100vh',
    breakpoint: 768,
    desktopButtonSize: 60,
    mobileButtonSize: 56
  };

  // Widget state
  let widgetInstance = null;
  let isInitialized = false;

  /**
   * Initialize the widget
   */
  async function initWidget(config) {
    if (isInitialized) {
      console.warn('Restaurant chatbot widget already initialized');
      return;
    }

    const {
      widgetId,
      width = WIDGET_CONFIG.defaultWidth,
      height = WIDGET_CONFIG.defaultHeight,
      position = 'bottom-right',
      colors = null,
      autoOpen = false
    } = config;

    if (!widgetId) {
      console.error('Restaurant chatbot widget: widgetId is required');
      return;
    }

    // Fetch brand colors from API if not provided
    let brandColors = colors;
    if (!brandColors) {
      try {
        const response = await fetch(`${WIDGET_CONFIG.baseUrl}/api/widget/${widgetId}`);
        const data = await response.json();
        brandColors = data.settings?.brand_colors || { primary: '#8B4513' };
      } catch (error) {
        console.warn('Failed to fetch brand colors, using default:', error);
        brandColors = { primary: '#8B4513' };
      }
    }

    // Create widget container
    const widgetContainer = createWidgetContainer(width, height, position);
    
    // Create iframe
    const iframe = createIframe(widgetId, brandColors);
    
    // Create toggle button
    const toggleButton = createToggleButton(position, brandColors);
    
    // Add elements to DOM
    document.body.appendChild(widgetContainer);
    document.body.appendChild(toggleButton);
    
    widgetContainer.appendChild(iframe);
    
    // Store instance
    widgetInstance = {
      container: widgetContainer,
      iframe: iframe,
      toggleButton: toggleButton,
      isOpen: autoOpen,
      config: { ...config, colors: brandColors }
    };

    // Set up event listeners
    setupEventListeners();
    
    // Show/hide based on autoOpen
    if (autoOpen) {
      showWidget();
    } else {
      hideWidget();
    }

    isInitialized = true;
    console.log('Restaurant chatbot widget initialized with brand colors:', brandColors);
  }

  /**
   * Create the main widget container
   */
  function createWidgetContainer(width, height, position) {
    const container = document.createElement('div');
    container.id = 'restaurant-chatbot-widget';
    
    // Check if mobile
    const isMobile = window.innerWidth <= WIDGET_CONFIG.breakpoint;
    
    container.style.cssText = `
      position: fixed;
      ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      width: ${isMobile ? WIDGET_CONFIG.mobileWidth : width + 'px'};
      height: ${isMobile ? WIDGET_CONFIG.mobileHeight : height + 'px'};
      border-radius: ${isMobile ? '0' : '12px'};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 999999;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: ${isMobile ? 'translateY(100%)' : 'scale(0)'};
      opacity: 0;
      pointer-events: none;
      ${isMobile ? `
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        top: 0 !important;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      ` : ''}
    `;

    // Responsive design with better mobile handling
    const mediaQuery = `@media (max-width: ${WIDGET_CONFIG.breakpoint}px) {
      #restaurant-chatbot-widget {
        width: ${WIDGET_CONFIG.mobileWidth} !important;
        height: ${WIDGET_CONFIG.mobileHeight} !important;
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        top: 0 !important;
        border-radius: 0 !important;
        padding-top: env(safe-area-inset-top) !important;
        padding-bottom: env(safe-area-inset-bottom) !important;
      }
    }`;

    // Add responsive styles
    const style = document.createElement('style');
    style.textContent = mediaQuery;
    document.head.appendChild(style);

    return container;
  }

  /**
   * Create the iframe element
   */
  function createIframe(widgetId, colors) {
    const iframe = document.createElement('iframe');
    
    // Build URL with parameters
    let url = `${WIDGET_CONFIG.baseUrl}/widget/${widgetId}`;
    if (colors) {
      url += `?colors=${encodeURIComponent(JSON.stringify(colors))}`;
    }
    
    iframe.src = url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: inherit;
    `;
    
    // Security attributes
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('loading', 'lazy');
    
    return iframe;
  }

  /**
   * Create the toggle button
   */
  function createToggleButton(position, colors) {
    const button = document.createElement('button');
    button.id = 'restaurant-chatbot-toggle';
    
    // Check if mobile for responsive sizing
    const isMobile = window.innerWidth <= WIDGET_CONFIG.breakpoint;
    const buttonSize = isMobile ? WIDGET_CONFIG.mobileButtonSize : WIDGET_CONFIG.desktopButtonSize;
    
    button.innerHTML = `
      <svg width="${buttonSize * 0.4}" height="${buttonSize * 0.4}" viewBox="0 0 24 24" fill="none">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 8H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 12H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Use brand colors if available, otherwise fallback to default
    const primaryColor = colors?.primary || '#8B4513';
    const shadowColor = hexToRgb(primaryColor);
    
    button.style.cssText = `
      position: fixed;
      ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      border-radius: 50%;
      background: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 4px 20px rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.4);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: flex;
      align-items: center;
      justify-content: center;
      ${isMobile ? `
        right: 20px !important;
        bottom: 20px !important;
        margin-bottom: env(safe-area-inset-bottom);
      ` : ''}
    `;

    // Add responsive styles for button
    const buttonMediaQuery = `@media (max-width: ${WIDGET_CONFIG.breakpoint}px) {
      #restaurant-chatbot-toggle {
        width: ${WIDGET_CONFIG.mobileButtonSize}px !important;
        height: ${WIDGET_CONFIG.mobileButtonSize}px !important;
        right: 20px !important;
        bottom: 20px !important;
        margin-bottom: env(safe-area-inset-bottom) !important;
      }
    }`;

    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = buttonMediaQuery;
    document.head.appendChild(buttonStyle);

    // Hover effects (desktop only)
    if (!isMobile) {
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = `0 6px 25px rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.6)`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = `0 4px 20px rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.4)`;
      });
    }

    return button;
  }

  /**
   * Convert hex color to RGB object
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 69, b: 19 }; // Default brown color
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    if (!widgetInstance) return;

    // Toggle button click
    widgetInstance.toggleButton.addEventListener('click', () => {
      if (widgetInstance.isOpen) {
        hideWidget();
      } else {
        showWidget();
      }
    });

    // Listen for messages from the iframe (minimize button)
    window.addEventListener('message', function(event) {
      console.log('Widget received message:', event.data)
      if (event.data && event.data.type === 'minimize' && widgetInstance && widgetInstance.isOpen) {
        console.log('Minimizing widget')
        hideWidget();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && widgetInstance.isOpen) {
        hideWidget();
      }
    });

    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (widgetInstance.isOpen && window.innerWidth <= WIDGET_CONFIG.breakpoint) {
        if (!widgetInstance.container.contains(e.target) && 
            !widgetInstance.toggleButton.contains(e.target)) {
          hideWidget();
        }
      }
    });
  }

  /**
   * Show the widget
   */
  function showWidget() {
    if (!widgetInstance) return;

    const isMobile = window.innerWidth <= WIDGET_CONFIG.breakpoint;
    
    if (isMobile) {
      // Mobile: Slide up from bottom with iOS-like animation
      widgetInstance.container.style.transform = 'translateY(0)';
      widgetInstance.container.style.opacity = '1';
      widgetInstance.container.style.pointerEvents = 'auto';
    } else {
      // Desktop: Scale animation
      widgetInstance.container.style.transform = 'scale(1)';
      widgetInstance.container.style.opacity = '1';
      widgetInstance.container.style.pointerEvents = 'auto';
    }
    
    widgetInstance.toggleButton.style.display = 'none';
    widgetInstance.isOpen = true;

    // Focus iframe for keyboard navigation
    setTimeout(() => {
      widgetInstance.iframe.focus();
    }, 300);
  }

  /**
   * Hide the widget
   */
  function hideWidget() {
    if (!widgetInstance) return;

    const isMobile = window.innerWidth <= WIDGET_CONFIG.breakpoint;
    
    if (isMobile) {
      // Mobile: Slide down animation
      widgetInstance.container.style.transform = 'translateY(100%)';
      widgetInstance.container.style.opacity = '0';
      widgetInstance.container.style.pointerEvents = 'none';
    } else {
      // Desktop: Scale animation
      widgetInstance.container.style.transform = 'scale(0)';
      widgetInstance.container.style.opacity = '0';
      widgetInstance.container.style.pointerEvents = 'none';
    }
    
    widgetInstance.toggleButton.style.display = 'flex';
    widgetInstance.isOpen = false;
  }

  /**
   * Destroy the widget
   */
  function destroyWidget() {
    if (!widgetInstance) return;

    if (widgetInstance.container.parentNode) {
      widgetInstance.container.parentNode.removeChild(widgetInstance.container);
    }
    if (widgetInstance.toggleButton.parentNode) {
      widgetInstance.toggleButton.parentNode.removeChild(widgetInstance.toggleButton);
    }

    widgetInstance = null;
    isInitialized = false;
  }

  /**
   * Public API
   */
  window.RestaurantChatbot = {
    init: initWidget,
    show: showWidget,
    hide: hideWidget,
    destroy: destroyWidget,
    isOpen: () => widgetInstance ? widgetInstance.isOpen : false
  };

  // Auto-initialize if config is provided via data attributes
  const scriptTag = document.currentScript;
  if (scriptTag) {
    const widgetId = scriptTag.getAttribute('data-widget-id');
    const width = parseInt(scriptTag.getAttribute('data-width')) || WIDGET_CONFIG.defaultWidth;
    const height = parseInt(scriptTag.getAttribute('data-height')) || WIDGET_CONFIG.defaultHeight;
    const position = scriptTag.getAttribute('data-position') || 'bottom-right';
    const autoOpen = scriptTag.getAttribute('data-auto-open') === 'true';

    if (widgetId) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
          await initWidget({ widgetId, width, height, position, autoOpen });
        });
      } else {
        initWidget({ widgetId, width, height, position, autoOpen });
      }
    }
  }

})();