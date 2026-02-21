// sheets/behaviors/tabs-behavior.js
// Manages external floating tabs for character sheets

import { SystemConstants } from '../../module/config/constants.js';

/**
 * TabsBehavior - Manages external floating tab navigation
 * Creates and positions tabs outside the main sheet window
 */
export const TabsBehavior = {
  
  /**
   * Create external floating tabs
   * @param {HTMLElement} sheetWindow - The sheet's window element
   * @param {string} activeTabId - The currently active tab
   * @param {Function} onTabChange - Callback function when tabs are clicked
   * @returns {HTMLElement} The created tabs container
   */
  createFloatingTabs(sheetWindow, activeTabId, onTabChange) {
    // Create container for tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'blb-external-tabs';
    
    // Create navigation element
    const tabsNav = document.createElement('nav');
    tabsNav.className = 'sheet-tabs tabs';
    tabsNav.setAttribute('data-group', 'primary');

    // Define available tabs
    const tabDefinitions = [
      { id: 'character', label: 'Character' },
      { id: 'equipment', label: 'Equipment' }
    ];

    // Create tab buttons
    tabDefinitions.forEach(tab => {
      const tabButton = document.createElement('a');
      tabButton.className = `item ${activeTabId === tab.id ? 'active' : ''}`;
      tabButton.dataset.tab = tab.id;
      tabButton.textContent = tab.label;
      
      // Add click handler
      tabButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onTabChange(tab.id);
      });

      tabsNav.appendChild(tabButton);
    });

    tabsContainer.appendChild(tabsNav);
    TabsBehavior.positionFloatingTabs(tabsContainer, sheetWindow);
    
    return tabsContainer;
  },

  /**
   * Position floating tabs relative to the sheet window
   * @param {HTMLElement} tabsContainer - The tabs container element
   * @param {HTMLElement} sheetWindow - The sheet's window element
   */
  positionFloatingTabs(tabsContainer, sheetWindow) {
    const windowRect = sheetWindow.getBoundingClientRect();
    const tabsX = windowRect.right;
    const tabsY = windowRect.top; 
    const tabsZ = Number(sheetWindow.style.zIndex); 
    
    tabsContainer.style.position = 'fixed';
    tabsContainer.style.left = `${tabsX}px`;
    tabsContainer.style.top = `${tabsY}px`;
    tabsContainer.style.zIndex = tabsZ;
    
    // Calculate clipping for tabs that extend below window
    const tabsHeight = SystemConstants.UI_LAYOUT.EXTERNAL_TABS.HEIGHT;
    const clipAmount = Math.max(0, (tabsY + tabsHeight) - windowRect.bottom);
    tabsContainer.style.clipPath = clipAmount > 0 ? `inset(0 0 ${clipAmount}px 0)` : 'none';
  },

  /**
   * Start tracking sheet window position to keep tabs aligned
   * @param {HTMLElement} tabsContainer - The tabs container element
   * @param {HTMLElement} sheetWindow - The sheet's window element
   * @returns {number} The animation frame ID for cleanup
   */
  startPositionTracking(tabsContainer, sheetWindow) {
    let lastX = 0, lastY = 0, lastZ = 0;
    
    const updatePosition = () => {
      // Check if elements still exist in DOM
      if (!tabsContainer || !sheetWindow || !document.body.contains(sheetWindow)) {
        return null; // Signal to stop tracking
      }

      const windowRect = sheetWindow.getBoundingClientRect();
      const config = SystemConstants.UI_LAYOUT.EXTERNAL_TABS;
      const newX = windowRect.right + config.OFFSET_X;
      const newY = windowRect.top + config.OFFSET_Y; 
      const newZ = Number(sheetWindow.style.zIndex);

      // Only update if position has changed
      if (newX !== lastX || newY !== lastY || newZ !== lastZ) {
        tabsContainer.style.left = `${newX}px`;
        tabsContainer.style.top = `${newY}px`;
        tabsContainer.style.zIndex = newZ;
        
        // Calculate clipping for tabs extending below window
        const tabsHeight = config.WIDTH; // Rotated, so width becomes height
        const clipAmount = Math.max(0, (newY + tabsHeight) - windowRect.bottom);
        tabsContainer.style.clipPath = clipAmount > 0 ? `inset(0 0 ${clipAmount}px 0)` : 'none';
        
        lastX = newX;
        lastY = newY;
        lastZ = newZ;
      }

      return requestAnimationFrame(updatePosition);
    };

    return requestAnimationFrame(updatePosition);
  },

  /**
   * Update the active state of floating tabs
   * @param {HTMLElement} tabsContainer - The tabs container element
   * @param {string} activeTabId - The currently active tab ID
   */
  updateActiveTab(tabsContainer, activeTabId) {
    if (!tabsContainer) return;

    const tabButtons = tabsContainer.querySelectorAll('.item');
    tabButtons.forEach(button => {
      if (button.dataset.tab === activeTabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  },

  /**
   * Clean up floating tabs and stop position tracking
   * @param {HTMLElement} tabsContainer - The tabs container element
   * @param {number} trackingFrameId - The animation frame ID
   */
  cleanupFloatingTabs(tabsContainer, trackingFrameId) {
    if (tabsContainer && document.body.contains(tabsContainer)) {
      tabsContainer.remove();
    }

    if (trackingFrameId) {
      cancelAnimationFrame(trackingFrameId);
    }
  }
};