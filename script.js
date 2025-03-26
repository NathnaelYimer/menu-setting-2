document.addEventListener("DOMContentLoaded", () => {
  // Enhanced initialization with loading animation
  document.body.classList.add('js-loading');
  
  setTimeout(() => {
    document.body.classList.remove('js-loading');
    document.body.classList.add('js-loaded');
  }, 500);

  // Get all draggable items
  const draggableItems = document.querySelectorAll(".feature-item");

  // Get all dropzones
  const dropzones = document.querySelectorAll(".kanban-dropzone");

  // Get all "Choose" buttons
  const chooseButtons = document.querySelectorAll(".choose-button");

  // Variable to store the currently dragged item
  let draggedItem = null;
  let originalPlan = null;
  let dragStartPosition = { x: 0, y: 0 };

  // Add event listeners to all draggable items
  draggableItems.forEach((item) => {
    setupDragListeners(item);
  });

  // Function to set up drag listeners for a new item
  function setupDragListeners(item) {
    // Drag start event
    item.addEventListener("dragstart", function (e) {
      draggedItem = this;
      originalPlan = this.getAttribute("data-plan");
      
      // Store initial position for better visual feedback
      dragStartPosition.x = e.clientX;
      dragStartPosition.y = e.clientY;

      // Add dragging class for visual feedback
      setTimeout(() => {
        this.classList.add("dragging");
        
        // Add dragging state to body for global cursor changes
        document.body.classList.add('is-dragging');
      }, 0);

      // Set data transfer
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
    });

    // Drag end event
    item.addEventListener("dragend", function () {
      // Remove dragging class
      this.classList.remove("dragging");
      document.body.classList.remove('is-dragging');
      
      // Add animation class for smooth return if not dropped in a valid zone
      if (this.parentNode) {
        this.classList.add('drag-return');
        setTimeout(() => {
          this.classList.remove('drag-return');
        }, 300);
      }
      
      draggedItem = null;
      originalPlan = null;
    });
    
    // Touch support for mobile devices
    item.addEventListener('touchstart', function(e) {
      const touch = e.targetTouches[0];
      dragStartPosition.x = touch.clientX;
      dragStartPosition.y = touch.clientY;
      
      this.classList.add('touch-dragging');
      draggedItem = this;
      originalPlan = this.getAttribute("data-plan");
    }, { passive: true });
    
    item.addEventListener('touchmove', function(e) {
      if (!draggedItem) return;
      
      const touch = e.targetTouches[0];
      const moveX = touch.clientX - dragStartPosition.x;
      const moveY = touch.clientY - dragStartPosition.y;
      
      this.style.transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Find dropzone under touch point
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elemBelow?.closest('.kanban-dropzone');
      
      // Remove highlight from all dropzones
      dropzones.forEach(zone => zone.classList.remove('highlight'));
      
      // Add highlight to current dropzone
      if (dropzone) {
        dropzone.classList.add('highlight');
      }
      
      e.preventDefault();
    });
    
    item.addEventListener('touchend', function(e) {
      if (!draggedItem) return;
      
      this.classList.remove('touch-dragging');
      this.style.transform = '';
      
      // Find dropzone under touch end point
      const touch = e.changedTouches[0];
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elemBelow?.closest('.kanban-dropzone');
      
      if (dropzone) {
        const targetPlan = dropzone.getAttribute("data-plan");
        
        // Only move if dropping to a different plan
        if (originalPlan !== targetPlan) {
          // Clone the item to keep its event listeners
          const clonedItem = draggedItem.cloneNode(true);
          
          // Update the plan attribute
          clonedItem.setAttribute("data-plan", targetPlan);
          
          // Update the checkmark color
          const checkmark = clonedItem.querySelector(".feature-check");
          checkmark.className = `feature-check ${targetPlan}-check`;
          
          // Add the item to the new dropzone
          dropzone.appendChild(clonedItem);
          
          // Remove the original item
          draggedItem.remove();
          
          // Add event listeners to the cloned item
          setupDragListeners(clonedItem);
          
          // Show success toast
          showToast(`Feature moved to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan`);
        }
      }
      
      // Remove highlight from all dropzones
      dropzones.forEach(zone => zone.classList.remove('highlight'));
      
      draggedItem = null;
      originalPlan = null;
    });
  }

  // Add event listeners to all dropzones
  dropzones.forEach((zone) => {
    // Dragover event
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("highlight");
      
      // Add pulsing animation class
      this.classList.add("pulse-animation");
    });

    // Dragleave event
    zone.addEventListener("dragleave", function () {
      this.classList.remove("highlight");
      this.classList.remove("pulse-animation");
    });

    // Drop event
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("highlight");
      this.classList.remove("pulse-animation");

      if (draggedItem) {
        const targetPlan = this.getAttribute("data-plan");

        // Only move if dropping to a different plan
        if (originalPlan !== targetPlan) {
          // Clone the item to keep its event listeners
          const clonedItem = draggedItem.cloneNode(true);

          // Update the plan attribute
          clonedItem.setAttribute("data-plan", targetPlan);

          // Update the checkmark color
          const checkmark = clonedItem.querySelector(".feature-check");
          checkmark.className = `feature-check ${targetPlan}-check`;

          // Add the item to the new dropzone with animation
          clonedItem.style.opacity = '0';
          clonedItem.style.transform = 'translateY(10px)';
          this.appendChild(clonedItem);
          
          // Trigger reflow for animation
          void clonedItem.offsetWidth;
          
          // Animate in
          clonedItem.style.transition = 'all 0.3s ease-out';
          clonedItem.style.opacity = '1';
          clonedItem.style.transform = 'translateY(0)';

          // Remove the original item with fade out animation
          draggedItem.style.transition = 'all 0.2s ease-out';
          draggedItem.style.opacity = '0';
          draggedItem.style.transform = 'scale(0.8)';
          
          setTimeout(() => {
            draggedItem.remove();
          }, 200);

          // Add event listeners to the cloned item
          setupDragListeners(clonedItem);
          
          // Show success toast
          showToast(`Feature moved to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan`);
        }
      }
    });
  });

  // Add click event listeners to all "Choose" buttons with enhanced feedback
  chooseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the plan type based on button class
      let planType = "";
      if (this.classList.contains("platinum")) planType = "Platinum";
      else if (this.classList.contains("gold")) planType = "Gold";
      else if (this.classList.contains("silver")) planType = "Silver";
      else if (this.classList.contains("bronze")) planType = "Bronze";
      else if (this.classList.contains("iron")) planType = "Iron";

      // Add click animation
      this.classList.add('button-clicked');
      
      // Remove animation class after animation completes
      setTimeout(() => {
        this.classList.remove('button-clicked');
      }, 300);
      
      // Highlight selected column
      const columnCells = document.querySelectorAll('.menu-table td');
      columnCells.forEach((cell, index) => {
        // Find the index of the current button's column
        if (cell.querySelector(`.choose-button.${planType.toLowerCase()}`)) {
          // Add selected class to the cell
          cell.classList.add('selected-plan');
          
          // Add glow effect to the header
          const headers = document.querySelectorAll('.menu-table th');
          headers[index].classList.add('selected-header');
        } else {
          // Remove selected class from other cells
          cell.classList.remove('selected-plan');
        }
      });
      
      // Get the header cells and highlight the corresponding one
      const headers = document.querySelectorAll('.menu-table th');
      headers.forEach(header => {
        header.classList.remove('selected-header');
      });
      
      // Show toast notification instead of alert
      showToast(`You've selected the ${planType} plan!`, false, 'success-toast');
    });
  });

  // Settings Modal Functionality with enhanced animations
  const settingsButton = document.getElementById("settings-button");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const saveSettingsBtn = document.getElementById("save-settings");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // Available products data - initialize from the DOM
  let availableProducts = [];
  
  // Initialize products from the DOM
  function initializeProductsFromDOM() {
    availableProducts = [];
    
    // Get all feature items from the DOM
    const featureItems = document.querySelectorAll('.feature-item');
    
    // Create a Set to track unique product names
    const uniqueProducts = new Set();
    
    featureItems.forEach((item, index) => {
      const productName = item.querySelector('.feature-content span:not(.feature-check)').textContent.trim();
      
      // Only add if not already in the set
      if (!uniqueProducts.has(productName)) {
        uniqueProducts.add(productName);
        
        // Create a new product object
        availableProducts.push({
          id: `p${availableProducts.length + 1}`,
          name: productName,
          value: ((Math.random() * 1000) + 100).toFixed(2) // Generate random value for demo
        });
      }
    });
  }

  // Column data - initialize from the DOM
  let columnData = [];
  
  // Initialize columns from the DOM
  function initializeColumnsFromDOM() {
    columnData = [];
    
    // Get all column headers
    const columnHeaders = document.querySelectorAll('.menu-table th');
    
    columnHeaders.forEach((header, index) => {
      const columnId = header.id.replace('column-', '') || 
                      header.textContent.toLowerCase().replace(/\s+/g, '-');
      
      // Get all products in this column
      const columnProducts = [];
      const featureItems = document.querySelectorAll(`.feature-item[data-plan="${columnId}"]`);
      
      featureItems.forEach(item => {
        const productName = item.querySelector('.feature-content span:not(.feature-check)').textContent.trim();
        
        // Find product ID by name
        const product = availableProducts.find(p => p.name === productName);
        if (product) {
          columnProducts.push(product.id);
        }
      });
      
      // Add column to data
      columnData.push({
        id: columnId,
        name: header.textContent.trim(),
        products: columnProducts
      });
    });
  }

  // Open settings modal with enhanced animation
  settingsButton.addEventListener("click", () => {
    // Initialize data from the DOM
    initializeProductsFromDOM();
    initializeColumnsFromDOM();
    
    settingsModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling
    
    // Add entrance animation class
    settingsModal.classList.add('modal-entering');
    
    // Trigger animations for modal content
    setTimeout(() => {
      settingsModal.classList.remove('modal-entering');
      settingsModal.classList.add('modal-entered');
    }, 50);
    
    populateProductAssignmentTable();
    populateProductList();
    
    // Update column names from the main table
    updateColumnNamesFromTable();
  });

  // Close settings modal with exit animation
  closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove('modal-entered');
    settingsModal.classList.add('modal-exiting');
    
    setTimeout(() => {
      settingsModal.style.display = "none";
      settingsModal.classList.remove('modal-exiting');
      document.body.style.overflow = "";
    }, 300);
  });

  // Close modal when clicking outside with exit animation
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('modal-entered');
      settingsModal.classList.add('modal-exiting');
      
      setTimeout(() => {
        settingsModal.style.display = "none";
        settingsModal.classList.remove('modal-exiting');
        document.body.style.overflow = "";
      }, 300);
    }
  });

  // Enhanced tab switching with smooth transitions
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the currently active tab
      const activeTab = document.querySelector('.tab-content.active');
      const activeTabId = activeTab.id;
      
      // Get the target tab
      const targetTabId = this.getAttribute("data-tab");
      const targetTab = document.getElementById(targetTabId);
      
      // Only proceed if we're changing tabs
      if (activeTabId !== targetTabId) {
        // Remove active class from all buttons
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        
        // Add active class to clicked button
        this.classList.add("active");
        
        // Fade out current tab
        activeTab.classList.add('tab-exiting');
        
        // After fade out, switch tabs and fade in new tab
        setTimeout(() => {
          // Hide all tabs
          tabContents.forEach((content) => {
            content.classList.remove("active");
            content.classList.remove("tab-exiting");
          });
          
          // Show and animate in the new tab
          targetTab.classList.add("active");
          targetTab.classList.add("tab-entering");
          
          // Remove animation class after animation completes
          setTimeout(() => {
            targetTab.classList.remove("tab-entering");
          }, 300);
        }, 200);
      }
    });
  });

  // Update column names from the main table
  function updateColumnNamesFromTable() {
    columnData.forEach((column) => {
      const headerCell = document.getElementById(`column-${column.id}`);
      if (headerCell) {
        const input = document.getElementById(`${column.id}-name`);
        if (input) {
          input.value = headerCell.textContent;
          column.name = headerCell.textContent;
        }
      }
    });
  }

  // Populate product assignment table with enhanced styling
  function populateProductAssignmentTable() {
    const tableBody = document.getElementById("product-assignment-body");
    tableBody.innerHTML = "";

    availableProducts.forEach((product, index) => {
      const row = document.createElement("tr");
      
      // Add staggered animation delay
      row.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
      row.style.opacity = "0";

      // Product name cell
      const nameCell = document.createElement("td");
      
      // Create a more detailed product display
      const productInfo = document.createElement("div");
      productInfo.className = "product-info";
      
      const productName = document.createElement("div");
      productName.className = "product-table-name";
      productName.textContent = product.name;
      
      const productValue = document.createElement("div");
      productValue.className = "product-table-value";
      productValue.textContent = `$${product.value}`;
      
      productInfo.appendChild(productName);
      productInfo.appendChild(productValue);
      nameCell.appendChild(productInfo);
      
      row.appendChild(nameCell);

      // Column cells with toggles
      columnData.forEach((column) => {
        const cell = document.createElement("td");
        cell.className = "toggle-cell";
        
        const label = document.createElement("label");
        label.className = "toggle-switch";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = column.products.includes(product.id);
        input.dataset.productId = product.id;
        input.dataset.columnId = column.id;
        
        // Add custom color class based on column
        label.classList.add(`${column.id}-toggle`);
        
        input.addEventListener("change", function() {
          toggleProductInColumn.call(this);
          
          // Add ripple effect on toggle
          const ripple = document.createElement("span");
          ripple.className = "toggle-ripple";
          label.appendChild(ripple);
          
          // Remove ripple after animation
          setTimeout(() => {
            label.removeChild(ripple);
          }, 600);
        });

        const slider = document.createElement("span");
        slider.className = "toggle-slider";

        label.appendChild(input);
        label.appendChild(slider);
        cell.appendChild(label);
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });
  }

  // Toggle product in column with visual feedback
  function toggleProductInColumn() {
    const productId = this.dataset.productId;
    const columnId = this.dataset.columnId;
    const isChecked = this.checked;

    // Update columnData
    const column = columnData.find((col) => col.id === columnId);
    if (isChecked) {
      // Add product to column if not already there
      if (!column.products.includes(productId)) {
        column.products.push(productId);
        
        // Show success toast
        const product = availableProducts.find(p => p.id === productId);
        showToast(`Added ${product.name} to ${column.name} plan`);
      }
    } else {
      // Remove product from column
      column.products = column.products.filter((id) => id !== productId);
      
      // Show info toast
      const product = availableProducts.find(p => p.id === productId);
      showToast(`Removed ${product.name} from ${column.name} plan`, false, 'info-toast');
    }
  }

  // Populate product list with enhanced animations
  function populateProductList() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    availableProducts.forEach((product, index) => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";
      productItem.dataset.productId = product.id;
      
      // Add staggered animation delay
      productItem.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
      productItem.style.opacity = "0";

      const productInfo = document.createElement("div");
      productInfo.className = "product-info";
      
      const productName = document.createElement("div");
      productName.className = "product-name";
      productName.textContent = product.name;
      
      const productValue = document.createElement("div");
      productValue.className = "product-value";
      productValue.textContent = `$${product.value}`;
      
      productInfo.appendChild(productName);
      productInfo.appendChild(productValue);

      const actionButtons = document.createElement("div");
      actionButtons.className = "product-actions";
      
      const editButton = document.createElement("button");
      editButton.className = "edit-product";
      editButton.innerHTML = '<i class="bi bi-pencil"></i>';
      editButton.addEventListener("click", () => {
        editProduct(product.id);
      });
      
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-product";
      deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
      deleteButton.addEventListener("click", () => {
        // Add confirmation with animation
        if (!productItem.classList.contains('confirm-delete')) {
          productItem.classList.add('confirm-delete');
          deleteButton.innerHTML = '<i class="bi bi-check-circle"></i>';
          
          // Add cancel button
          const cancelButton = document.createElement("button");
          cancelButton.className = "cancel-delete";
          cancelButton.innerHTML = '<i class="bi bi-x-circle"></i>';
          cancelButton.addEventListener("click", (e) => {
            e.stopPropagation();
            productItem.classList.remove('confirm-delete');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            actionButtons.removeChild(cancelButton);
          });
          
          actionButtons.insertBefore(cancelButton, deleteButton);
          
          // Auto-cancel after 3 seconds
          setTimeout(() => {
            if (productItem.classList.contains('confirm-delete') && productItem.parentNode) {
              productItem.classList.remove('confirm-delete');
              deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
              if (actionButtons.contains(cancelButton)) {
                actionButtons.removeChild(cancelButton);
              }
            }
          }, 3000);
        } else {
          deleteProduct(product.id);
        }
      });
      
      actionButtons.appendChild(editButton);
      actionButtons.appendChild(deleteButton);

      productItem.appendChild(productInfo);
      productItem.appendChild(actionButtons);
      productList.appendChild(productItem);
    });
  }

  // Edit product function
  function editProduct(productId) {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Find the product item in the DOM
    const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
    if (!productItem) return;
    
    // Check if already in edit mode
    if (productItem.classList.contains('editing')) return;
    
    // Store original content
    const originalContent = productItem.innerHTML;
    productItem.classList.add('editing');
    
    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'product-edit-form';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'edit-product-name';
    nameInput.value = product.name;
    nameInput.placeholder = 'Product Name';
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'edit-product-value';
    valueInput.value = product.value;
    valueInput.placeholder = 'Value (e.g. 500.00)';
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'edit-buttons';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'save-edit';
    saveButton.innerHTML = '<i class="bi bi-check"></i> Save';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-edit';
    cancelButton.innerHTML = '<i class="bi bi-x"></i> Cancel';
    
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(cancelButton);
    
    editForm.appendChild(nameInput);
    editForm.appendChild(valueInput);
    editForm.appendChild(buttonGroup);
    
    // Clear and add edit form
    productItem.innerHTML = '';
    productItem.appendChild(editForm);
    
    // Focus on name input
    nameInput.focus();
    
    // Save button event
    saveButton.addEventListener('click', () => {
      const newName = nameInput.value.trim();
      const newValue = valueInput.value.trim();
      
      if (newName && newValue) {
        // Update product data
        product.name = newName;
        product.value = newValue;
        
        // Exit edit mode
        productItem.classList.remove('editing');
        
        // Refresh product list
        populateProductList();
        populateProductAssignmentTable();
        
        // Show success toast
        showToast(`Product updated successfully`);
      } else {
        // Show error toast
        showToast('Please fill in all fields', true);
        
        // Shake animation for validation
        editForm.classList.add('validation-error');
        setTimeout(() => {
          editForm.classList.remove('validation-error');
        }, 500);
      }
    });
    
    // Cancel button event
    cancelButton.addEventListener('click', () => {
      productItem.classList.remove('editing');
      productItem.innerHTML = originalContent;
      
      // Re-attach event listeners
      const newDeleteBtn = productItem.querySelector('.delete-product');
      if (newDeleteBtn) {
        newDeleteBtn.addEventListener('click', () => deleteProduct(productId));
      }
      
      const newEditBtn = productItem.querySelector('.edit-product');
      if (newEditBtn) {
        newEditBtn.addEventListener('click', () => editProduct(productId));
      }
    });
  }

  // Delete product with animation
  function deleteProduct(productId) {
    // Find the product item in the DOM
    const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
    
    if (productItem) {
      // Add exit animation
      productItem.classList.add('deleting');
      
      // Wait for animation to complete
      setTimeout(() => {
        // Find the product to be deleted
        const index = availableProducts.findIndex((p) => p.id === productId);
        if (index !== -1) {
          const deletedProduct = availableProducts[index];
          
          // Remove from availableProducts
          availableProducts.splice(index, 1);
          
          // Remove from all columns
          columnData.forEach((column) => {
            column.products = column.products.filter((id) => id !== productId);
          });
          
          // Update UI
          populateProductList();
          populateProductAssignmentTable();
          
          // Show toast
          showToast(`${deletedProduct.name} deleted successfully`);
        }
      }, 300);
    }
  }

  // Add new product with enhanced validation and animation
  const addProductBtn = document.getElementById("add-product-btn");
  const newProductNameInput = document.getElementById("new-product-name");
  
  // Create value input if it doesn't exist
  let newProductValueInput = document.getElementById("new-product-value");
  
  if (!newProductValueInput) {
    newProductValueInput = document.createElement("input");
    newProductValueInput.id = "new-product-value";
    newProductValueInput.className = "column-name-input";
    newProductValueInput.placeholder = "Enter value (e.g. 500.00)";
    
    // Create label for value input
    const valueLabel = document.createElement("label");
    valueLabel.htmlFor = "new-product-value";
    valueLabel.textContent = "Product Value ($):";
    
    // Create input group for value
    const valueGroup = document.createElement("div");
    valueGroup.className = "input-group";
    valueGroup.appendChild(valueLabel);
    valueGroup.appendChild(newProductValueInput);
    
    // Add to form
    const addProductForm = document.querySelector(".add-product-form");
    addProductForm.insertBefore(valueGroup, addProductBtn);
  }

  // Enhanced validation for inputs
  [newProductNameInput, newProductValueInput].forEach(input => {
    if (!input) return;
    
    input.addEventListener('input', function() {
      validateInput(this);
    });
    
    input.addEventListener('blur', function() {
      validateInput(this, true);
    });
  });
  
  function validateInput(input, showError = false) {
    const value = input.value.trim();
    
    if (!value && showError) {
      input.classList.add('input-error');
      
      // Add error message if it doesn't exist
      let errorMsg = input.nextElementSibling;
      if (!errorMsg || !errorMsg.classList.contains('error-message')) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This field is required';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
      }
    } else {
      input.classList.remove('input-error');
      
      // Remove error message if it exists
      const errorMsg = input.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains('error-message')) {
        input.parentNode.removeChild(errorMsg);
      }
    }
    
    return !!value;
  }

  addProductBtn.addEventListener("click", () => {
    const productName = newProductNameInput.value.trim();
    const productValue = newProductValueInput ? newProductValueInput.value.trim() : "0.00";
    
    // Validate inputs
    const nameValid = validateInput(newProductNameInput, true);
    const valueValid = newProductValueInput ? validateInput(newProductValueInput, true) : true;

    if (nameValid && valueValid) {
      // Add button press animation
      addProductBtn.classList.add('button-pressed');
      
      setTimeout(() => {
        addProductBtn.classList.remove('button-pressed');
        
        // Generate new ID
        const newId = "p" + (availableProducts.length + 1);

        // Add to availableProducts
        availableProducts.push({ id: newId, name: productName, value: productValue });

        // Clear inputs
        newProductNameInput.value = "";
        if (newProductValueInput) newProductValueInput.value = "";

        // Update UI
        populateProductList();
        populateProductAssignmentTable();

        // Show toast
        showToast(`${productName} added successfully`);
      }, 200);
    } else {
      // Shake the form for invalid inputs
      const addProductForm = document.querySelector(".add-product-form");
      if (addProductForm) {
        addProductForm.classList.add('validation-error');
        setTimeout(() => {
          addProductForm.classList.remove('validation-error');
        }, 500);
      }
      
      showToast("Please fill in all required fields", true);
    }
  });

  // Save settings with enhanced animation and feedback
  saveSettingsBtn.addEventListener("click", () => {
    // Add button press animation
    saveSettingsBtn.classList.add('button-pressed');
    saveSettingsBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';
    
    setTimeout(() => {
      // Update column names
      columnData.forEach((column) => {
        const input = document.getElementById(`${column.id}-name`);
        if (input) {
          column.name = input.value;

          // Update column header in the main table
          const columnHeader = document.getElementById(`column-${column.id}`);
          if (columnHeader) {
            // Add animation to header update
            columnHeader.classList.add('updating');
            columnHeader.textContent = column.name;
            
            setTimeout(() => {
              columnHeader.classList.remove('updating');
            }, 500);
          }
        }
      });

      // Update the actual menu items based on product assignments
      updateMenuItems();

      // Reset button state
      saveSettingsBtn.classList.remove('button-pressed');
      saveSettingsBtn.innerHTML = '<i class="bi bi-check-circle"></i> Save Settings';

      // Close modal with exit animation
      settingsModal.classList.remove('modal-entered');
      settingsModal.classList.add('modal-exiting');
      
      setTimeout(() => {
        settingsModal.style.display = "none";
        settingsModal.classList.remove('modal-exiting');
        document.body.style.overflow = "";
      }, 300);

      // Show toast with success animation
      showToast("Settings saved successfully", false, 'success-toast');
    }, 800); // Simulate saving delay for better UX
  });

  // Function to update menu items based on settings
  function updateMenuItems() {
    // Update each column's feature list
    columnData.forEach(column => {
      // Get the feature list for this column
      const featureList = document.querySelector(`.kanban-dropzone[data-plan="${column.id}"]`);
      if (!featureList) return;
      
      // Clear existing items
      featureList.innerHTML = '';
      
      // Add products assigned to this column
      column.products.forEach(productId => {
        const product = availableProducts.find(p => p.id === productId);
        if (!product) return;
        
        // Create new feature item
        const featureItem = document.createElement('li');
        featureItem.className = 'feature-item';
        featureItem.draggable = true;
        featureItem.dataset.id = productId;
        featureItem.dataset.plan = column.id;
        
        const featureContent = document.createElement('div');
        featureContent.className = 'feature-content';
        
        const checkmark = document.createElement('span');
        checkmark.className = `feature-check ${column.id}-check`;
        checkmark.textContent = '✓';
        
        const productName = document.createElement('span');
        productName.textContent = product.name;
        
        featureContent.appendChild(checkmark);
        featureContent.appendChild(productName);
        featureItem.appendChild(featureContent);
        
        // Add to feature list
        featureList.appendChild(featureItem);
        
        // Set up drag listeners
        setupDragListeners(featureItem);
      });
    });
  }

  // Enhanced toast notification with types and animations
  function showToast(message, isError = false, customClass = '') {
    toastMessage.textContent = message;
    
    // Reset classes
    toast.className = 'toast';
    if (customClass) {
      toast.classList.add(customClass);
    }

    if (isError) {
      toast.style.borderLeftColor = "var(--gold-color)";
      document.querySelector(".toast-icon").style.color = "var(--gold-color)";
      document.querySelector(".toast-icon").className = "bi bi-exclamation-circle toast-icon";
    } else {
      toast.style.borderLeftColor = "var(--platinum-color)";
      document.querySelector(".toast-icon").style.color = "var(--platinum-color)";
      document.querySelector(".toast-icon").className = "bi bi-check-circle toast-icon";
    }

    // Add show class with animation
    toast.classList.add("show");
    
    // Reset any existing timeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    // Hide toast after 3 seconds
    toast.timeoutId = setTimeout(() => {
      toast.classList.add('hiding');
      
      setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.remove('hiding');
      }, 300);
    }, 3000);
  }
  
  // Add keyboard shortcuts for accessibility
  document.addEventListener('keydown', function(e) {
    // ESC key to close modal
    if (e.key === 'Escape' && settingsModal.style.display === 'block') {
      closeSettings.click();
    }
    
    // Ctrl+S to save settings when modal is open
    if (e.ctrlKey && e.key === 's' && settingsModal.style.display === 'block') {
      e.preventDefault();
      saveSettingsBtn.click();
    }
  });
  
  // Add CSS classes for animations
  const style = document.createElement('style');
  style.textContent = `
    .js-loading { opacity: 0; }
    .js-loaded { opacity: 1; transition: opacity 0.5s ease-in; }
    
    .modal-entering { opacity: 0; }
    .modal-entered { opacity: 1; transition: opacity 0.3s ease-out; }
    .modal-exiting { opacity: 0; transition: opacity 0.3s ease-in; }
    
    .tab-entering { animation: fadeIn 0.3s ease-out; }
    .tab-exiting { animation: fadeOut 0.2s ease-in; opacity: 0; }
    
    .button-pressed { transform: scale(0.95); opacity: 0.9; }
    .button-clicked { animation: buttonPulse 0.3s ease-out; }
    
    .selected-plan { box-shadow: 0 0 20px var(--platinum-glow); transform: translateY(-10px); z-index: 20; }
    .selected-header { animation: headerPulse 2s infinite; }
    
    .product-edit-form { display: flex; flex-direction: column; gap: 10px; }
    .edit-buttons { display: flex; gap: 8px; margin-top: 5px; }
    .save-edit { background: var(--platinum-gradient); color: white; border: none; padding: 5px 10px; border-radius: var(--radius-md); }
    .cancel-edit { background: rgba(255,255,255,0.1); color: white; border: none; padding: 5px 10px; border-radius: var(--radius-md); }
    
    .product-info { display: flex; flex-direction: column; }
    .product-value, .product-table-value { font-size: 12px; color: var(--text-muted); }
    
    .product-actions { display: flex; gap: 8px; }
    .edit-product { background: none; border: none; color: var(--platinum-color); cursor: pointer; padding: 5px; border-radius: 50%; }
    .edit-product:hover { background: rgba(52, 152, 219, 0.2); }
    
    .confirm-delete { background-color: rgba(231, 76, 60, 0.2); border-color: var(--gold-color); }
    .cancel-delete { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 5px; border-radius: 50%; }
    
    .deleting { animation: deleteItem 0.3s ease-out forwards; }
    
    .input-error { border-color: var(--gold-color) !important; box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3) !important; }
    .error-message { color: var(--gold-color); font-size: 12px; margin-top: 4px; }
    
    .validation-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    
    .toggle-ripple { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 0; height: 0; border-radius: 50%; background: rgba(255,255,255,0.4); animation: ripple 0.6s ease-out; }
    
    .success-toast { border-left-color: var(--bronze-color) !important; }
    .success-toast .toast-icon { color: var(--bronze-color) !important; }
    
    .info-toast { border-left-color: var(--silver-color) !important; }
    .info-toast .toast-icon { color: var(--silver-color) !important; }
    
    .toast.hiding { transform: translateX(120%); transition: transform 0.3s ease-in; }
    
    .platinum-toggle .toggle-slider { background-color: rgba(52, 152, 219, 0.3); }
    .gold-toggle .toggle-slider { background-color: rgba(231, 76, 60, 0.3); }
    .silver-toggle .toggle-slider { background-color: rgba(243, 156, 18, 0.3); }
    .bronze-toggle .toggle-slider { background-color: rgba(46, 204, 113, 0.3); }
    .iron-toggle .toggle-slider { background-color: rgba(52, 73, 94, 0.3); }
    
    .updating { animation: flash 0.5s ease-out; }
    
    @keyframes flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; background-color: rgba(255,255,255,0.2); }
    }
    
    @keyframes buttonPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes headerPulse {
      0% { box-shadow: 0 -2px 15px var(--platinum-glow); }
      50% { box-shadow: 0 -2px 25px var(--platinum-glow), 0 0 10px var(--platinum-glow); }
      100% { box-shadow: 0 -2px 15px var(--platinum-glow); }
    }
    
    @keyframes deleteItem {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.8); height: 0; margin: 0; padding: 0; border: none; }
    }
    
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
      40%, 60% { transform: translate3d(3px, 0, 0); }
    }
    
    @keyframes ripple {
      0% { width: 0; height: 0; opacity: 1; }
      100% { width: 50px; height: 50px; opacity: 0; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
});