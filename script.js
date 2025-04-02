document.addEventListener("DOMContentLoaded", () => {
  // Sidebar Toggle Functionality
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")

  // Function to toggle sidebar
  function toggleSidebar() {
    // Check if we're on mobile or desktop
    if (window.innerWidth <= 768) {
      // Mobile behavior - overlay sidebar
      document.body.classList.toggle("sidebar-open")
    } else {
      // Desktop behavior - push content
      document.body.classList.toggle("sidebar-collapsed")
    }
  }

  // Add click event to toggle button
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  // Close sidebar when clicking outside on mobile
  if (mainContent) {
    mainContent.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && document.body.classList.contains("sidebar-open")) {
        document.body.classList.remove("sidebar-open")
      }
    })
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      document.body.classList.remove("sidebar-open")
    } else {
      document.body.classList.remove("sidebar-collapsed")
    }
  })

  // Make sure settings button in sidebar opens the modal
  const sidebarSettingsButton = document.querySelector(".sidebar-menu-item #settings-button")
  if (sidebarSettingsButton) {
    sidebarSettingsButton.addEventListener("click", (e) => {
      e.preventDefault()
      const settingsModal = document.getElementById("settings-modal")
      if (settingsModal) {
        settingsModal.style.display = "block"
        document.body.style.overflow = "hidden"
      }
    })
  }

  // Enhanced initialization with loading animation
  document.body.classList.add("js-loading")

  setTimeout(() => {
    document.body.classList.remove("js-loading")
    document.body.classList.add("js-loaded")
  }, 500)

  // *** DRAG AND DROP FUNCTIONALITY ***

  // Get all draggable items
  const draggableItems = document.querySelectorAll(".feature-item")

  // Get all dropzones
  const dropzones = document.querySelectorAll(".kanban-dropzone")

  // Get all "Choose" buttons
  const chooseButtons = document.querySelectorAll(".choose-button")

  // Variable to store the currently dragged item
  let draggedItem = null
  let originalPlan = null
  let draggedItemClone = null
  let dragStartPosition = { x: 0, y: 0 }
  let touchStartPosition = { x: 0, y: 0 }

  // Add event listeners to all draggable items
  draggableItems.forEach((item) => {
    setupDragListeners(item)
  })

  // Function to set up drag listeners for an item
  function setupDragListeners(item) {
    // Make sure the item is draggable
    item.setAttribute("draggable", "true")

    // Drag start event
    item.addEventListener("dragstart", function (e) {
      e.stopPropagation()
      draggedItem = this
      originalPlan = this.getAttribute("data-plan")

      // Create a clone for visual feedback
      draggedItemClone = this.cloneNode(true)
      draggedItemClone.classList.add("dragging-clone")
      draggedItemClone.style.position = "absolute"
      draggedItemClone.style.zIndex = "1000"
      draggedItemClone.style.opacity = "0.8"
      draggedItemClone.style.pointerEvents = "none"
      // Add rotation to the clone - make it turn sideways
      draggedItemClone.style.transform = "rotate(5deg)"
      document.body.appendChild(draggedItemClone)

      // Store initial position
      dragStartPosition = {
        x: e.clientX,
        y: e.clientY,
      }

      // Set drag image to transparent (we'll use our own visual)
      const img = new Image()
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      e.dataTransfer.setDragImage(img, 0, 0)

      // Add dragging class for visual feedback
      setTimeout(() => {
        this.classList.add("dragging")
        document.body.classList.add("is-dragging")
      }, 0)

      // Set data transfer
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"))
      e.dataTransfer.effectAllowed = "move"

      // Highlight all valid dropzones
      dropzones.forEach((zone) => {
        if (zone.getAttribute("data-plan") !== originalPlan) {
          zone.classList.add("potential-target")
        }
      })
    })

    // Drag event for updating clone position
    document.addEventListener("dragover", (e) => {
      if (draggedItemClone) {
        // Update position and increase rotation based on movement
        draggedItemClone.style.left = e.clientX - 20 + "px"
        draggedItemClone.style.top = e.clientY - 20 + "px"

        // Calculate rotation based on horizontal movement for a more dynamic effect
        const moveX = e.clientX - dragStartPosition.x
        const rotation = 5 + (moveX / 100) * 3 // Base rotation + dynamic component
        draggedItemClone.style.transform = `rotate(${rotation}deg)`
      }
    })

    // Drag end event
    item.addEventListener("dragend", function (e) {
      // Remove dragging class
      this.classList.remove("dragging")
      document.body.classList.remove("is-dragging")

      // Remove clone
      if (draggedItemClone && draggedItemClone.parentNode) {
        draggedItemClone.parentNode.removeChild(draggedItemClone)
      }
      draggedItemClone = null

      // Remove highlight from all dropzones
      dropzones.forEach((zone) => {
        zone.classList.remove("highlight")
        zone.classList.remove("potential-target")
        zone.classList.remove("pulse-animation")
      })

      // Add animation class for smooth return if not dropped in a valid zone
      if (this.parentNode) {
        this.classList.add("drag-return")
        setTimeout(() => {
          this.classList.remove("drag-return")
        }, 300)
      }

      draggedItem = null
      originalPlan = null
    })

    // Touch support for mobile devices
    item.addEventListener(
      "touchstart",
      function (e) {
        e.stopPropagation()
        const touch = e.targetTouches[0]

        // Store the initial touch position
        touchStartPosition = {
          x: touch.clientX,
          y: touch.clientY,
        }

        // Set the dragged item
        draggedItem = this
        originalPlan = this.getAttribute("data-plan")

        // Create visual feedback clone
        draggedItemClone = this.cloneNode(true)
        draggedItemClone.classList.add("dragging-clone")
        draggedItemClone.style.position = "absolute"
        draggedItemClone.style.left = touch.clientX + "px"
        draggedItemClone.style.top = touch.clientY + "px"
        draggedItemClone.style.zIndex = "1000"
        draggedItemClone.style.opacity = "0.8"
        draggedItemClone.style.pointerEvents = "none"
        draggedItemClone.style.transform = "translate(-50%, -50%) rotate(5deg)"
        draggedItemClone.style.width = this.offsetWidth + "px"
        document.body.appendChild(draggedItemClone)

        // Add visual feedback
        this.classList.add("touch-dragging")
        document.body.classList.add("is-dragging")

        // Highlight all valid dropzones
        dropzones.forEach((zone) => {
          if (zone.getAttribute("data-plan") !== originalPlan) {
            zone.classList.add("potential-target")
          }
        })
      },
      { passive: false },
    )

    item.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault() // Prevent scrolling while dragging

        if (!draggedItem || !draggedItemClone) return

        const touch = e.targetTouches[0]

        // Update clone position
        draggedItemClone.style.left = touch.clientX + "px"
        draggedItemClone.style.top = touch.clientY + "px"

        // Calculate rotation based on horizontal movement
        const moveX = touch.clientX - touchStartPosition.x
        const rotation = 5 + (moveX / 100) * 3 // Base rotation + dynamic component
        draggedItemClone.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`

        // Find dropzone under touch point
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY)
        const dropzone = elemBelow ? elemBelow.closest(".kanban-dropzone") : null

        // Remove highlight from all dropzones
        dropzones.forEach((zone) => {
          zone.classList.remove("highlight")
          zone.classList.remove("pulse-animation")
        })

        // Add highlight to current dropzone if it's a valid target
        if (dropzone && dropzone.getAttribute("data-plan") !== originalPlan) {
          dropzone.classList.add("highlight")
          dropzone.classList.add("pulse-animation")
        }
      },
      { passive: false },
    )

    item.addEventListener(
      "touchend",
      function (e) {
        e.preventDefault()

        if (!draggedItem) return

        // Remove visual feedback
        this.classList.remove("touch-dragging")
        document.body.classList.remove("is-dragging")

        // Get the touch end position
        const touch = e.changedTouches[0]

        // Find dropzone under touch end point
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY)
        const dropzone = elemBelow ? elemBelow.closest(".kanban-dropzone") : null

        // Remove clone
        if (draggedItemClone && draggedItemClone.parentNode) {
          draggedItemClone.parentNode.removeChild(draggedItemClone)
        }
        draggedItemClone = null

        // Process drop if on a valid dropzone
        if (dropzone) {
          const targetPlan = dropzone.getAttribute("data-plan")

          // Only move if dropping to a different plan
          if (originalPlan !== targetPlan) {
            // Clone the item to keep its event listeners
            const clonedItem = draggedItem.cloneNode(true)

            // Update the plan attribute
            clonedItem.setAttribute("data-plan", targetPlan)

            // Update the checkmark color
            const checkmark = clonedItem.querySelector(".feature-check")
            if (checkmark) {
              checkmark.className = `feature-check ${targetPlan}-check`
            }

            // Add the item to the new dropzone with animation
            clonedItem.style.opacity = "0"
            clonedItem.style.transform = "translateY(10px)"
            dropzone.appendChild(clonedItem)

            // Trigger reflow for animation
            void clonedItem.offsetWidth

            // Animate in
            clonedItem.style.transition = "all 0.3s ease-out"
            clonedItem.style.opacity = "1"
            clonedItem.style.transform = "translateY(0)"

            // Remove the original item with fade out animation
            draggedItem.style.transition = "all 0.2s ease-out"
            draggedItem.style.opacity = "0"
            draggedItem.style.transform = "scale(0.8)"
            draggedItem.style.height = "0"
            draggedItem.style.margin = "0"
            draggedItem.style.padding = "0"
            draggedItem.style.border = "none"

            setTimeout(() => {
              if (draggedItem.parentNode) {
                draggedItem.parentNode.removeChild(draggedItem)
              }
            }, 200)

            // Add event listeners to the cloned item
            setupDragListeners(clonedItem)

            // Show success toast
            showToast(`Feature moved to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan`)
          }
        }

        // Remove highlight from all dropzones
        dropzones.forEach((zone) => {
          zone.classList.remove("highlight")
          zone.classList.remove("potential-target")
          zone.classList.remove("pulse-animation")
        })

        draggedItem = null
        originalPlan = null
      },
      { passive: false },
    )

    // Prevent touchcancel from breaking the drag operation
    item.addEventListener(
      "touchcancel",
      function (e) {
        if (draggedItemClone && draggedItemClone.parentNode) {
          draggedItemClone.parentNode.removeChild(draggedItemClone)
        }
        draggedItemClone = null

        this.classList.remove("touch-dragging")
        document.body.classList.remove("is-dragging")

        // Remove highlight from all dropzones
        dropzones.forEach((zone) => {
          zone.classList.remove("highlight")
          zone.classList.remove("potential-target")
          zone.classList.remove("pulse-animation")
        })

        draggedItem = null
        originalPlan = null
      },
      { passive: true },
    )
  }

  // Add event listeners to all dropzones
  dropzones.forEach((zone) => {
    // Dragover event
    zone.addEventListener("dragover", function (e) {
      e.preventDefault()

      // Only highlight if this is a different plan than the original
      if (draggedItem && this.getAttribute("data-plan") !== originalPlan) {
        this.classList.add("highlight")
        this.classList.add("pulse-animation")
        e.dataTransfer.dropEffect = "move"
      }
    })

    // Dragleave event
    zone.addEventListener("dragleave", function (e) {
      this.classList.remove("highlight")
      this.classList.remove("pulse-animation")
    })

    // Drop event
    zone.addEventListener("drop", function (e) {
      e.preventDefault()
      e.stopPropagation()

      this.classList.remove("highlight")
      this.classList.remove("pulse-animation")

      if (draggedItem) {
        const targetPlan = this.getAttribute("data-plan")

        // Only move if dropping to a different plan
        if (originalPlan !== targetPlan) {
          // Clone the item to keep its event listeners
          const clonedItem = draggedItem.cloneNode(true)

          // Update the plan attribute
          clonedItem.setAttribute("data-plan", targetPlan)

          // Update the checkmark color
          const checkmark = clonedItem.querySelector(".feature-check")
          if (checkmark) {
            checkmark.className = `feature-check ${targetPlan}-check`
          }

          // Add the item to the new dropzone with animation
          clonedItem.style.opacity = "0"
          clonedItem.style.transform = "translateY(10px)"
          this.appendChild(clonedItem)

          // Trigger reflow for animation
          void clonedItem.offsetWidth

          // Animate in
          clonedItem.style.transition = "all 0.3s ease-out"
          clonedItem.style.opacity = "1"
          clonedItem.style.transform = "translateY(0)"

          // Remove the original item with fade out animation
          draggedItem.style.transition = "all 0.2s ease-out"
          draggedItem.style.opacity = "0"
          draggedItem.style.transform = "scale(0.8)"
          // Fix for the space issue - collapse the height and margins
          draggedItem.style.height = "0"
          draggedItem.style.margin = "0"
          draggedItem.style.padding = "0"
          draggedItem.style.border = "none"

          setTimeout(() => {
            if (draggedItem.parentNode) {
              draggedItem.parentNode.removeChild(draggedItem)
            }
          }, 200)

          // Add event listeners to the cloned item
          setupDragListeners(clonedItem)

          // Show success toast
          showToast(`Feature moved to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan`)
        }
      }
    })
  })

  // Add click event listeners to all "Choose" buttons with enhanced feedback
  chooseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the plan type based on button class
      let planType = ""
      if (this.classList.contains("platinum")) planType = "Platinum"
      else if (this.classList.contains("gold")) planType = "Gold"
      else if (this.classList.contains("silver")) planType = "Silver"
      else if (this.classList.contains("bronze")) planType = "Bronze"
      else if (this.classList.contains("iron")) planType = "Iron"

      // Add click animation
      this.classList.add("button-clicked")

      // Remove animation class after animation completes
      setTimeout(() => {
        this.classList.remove("button-clicked")
      }, 300)

      // Highlight selected column
      const columnCells = document.querySelectorAll(".menu-table td")
      columnCells.forEach((cell, index) => {
        // Find the index of the current button's column
        if (cell.querySelector(`.choose-button.${planType.toLowerCase()}`)) {
          // Add selected class to the cell
          cell.classList.add("selected-plan")

          // Add glow effect to the header
          const headers = document.querySelectorAll(".menu-table th")
          headers[index].classList.add("selected-header")
        } else {
          // Remove selected class from other cells
          cell.classList.remove("selected-plan")
        }
      })

      // Get the header cells and highlight the corresponding one
      const headers = document.querySelectorAll(".menu-table th")
      headers.forEach((header) => {
        header.classList.remove("selected-header")
      })

      // Show toast notification instead of alert
      showToast(`You've selected the ${planType} plan!`, false, "success-toast")
    })
  })

  // Settings Modal Functionality with enhanced animations
  const settingsButton = document.getElementById("settings-button")
  const settingsModal = document.getElementById("settings-modal")
  const closeSettings = document.getElementById("close-settings")
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")
  const saveSettingsBtn = document.getElementById("save-settings")
  const toast = document.getElementById("toast")
  const toastMessage = document.getElementById("toast-message")

  // Available products data - initialize from the DOM
  let availableProducts = []

  // Initialize products from the DOM
  function initializeProductsFromDOM() {
    availableProducts = []

    // Get all feature items from the DOM
    const featureItems = document.querySelectorAll(".feature-item")

    // Create a Set to track unique product names
    const uniqueProducts = new Set()

    featureItems.forEach((item, index) => {
      const productName = item.querySelector(".feature-content span:not(.feature-check)").textContent.trim()

      // Only add if not already in the set
      if (!uniqueProducts.has(productName)) {
        uniqueProducts.add(productName)

        // Create a new product object
        availableProducts.push({
          id: `p${availableProducts.length + 1}`,
          name: productName,
          value: (Math.random() * 1000 + 100).toFixed(2), // Generate random value for demo
        })
      }
    })
  }

  // Column data - initialize from the DOM
  let columnData = []

  // Initialize columns from the DOM
  function initializeColumnsFromDOM() {
    columnData = []

    // Get all column headers
    const columnHeaders = document.querySelectorAll(".menu-table th")

    columnHeaders.forEach((header, index) => {
      const columnId = header.id.replace("column-", "") || header.textContent.toLowerCase().replace(/\s+/g, "-")

      // Get all products in this column
      const columnProducts = []
      const featureItems = document.querySelectorAll(`.feature-item[data-plan="${columnId}"]`)

      featureItems.forEach((item) => {
        const productName = item.querySelector(".feature-content span:not(.feature-check)").textContent.trim()

        // Find product ID by name
        const product = availableProducts.find((p) => p.name === productName)
        if (product) {
          columnProducts.push(product.id)
        }
      })

      // Add column to data
      columnData.push({
        id: columnId,
        name: header.textContent.trim(),
        products: columnProducts,
        termMonths: 60, // Default term months
      })
    })
  }

  // Open settings modal with enhanced animation
  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      // Initialize data from the DOM
      initializeProductsFromDOM()
      initializeColumnsFromDOM()

      settingsModal.style.display = "block"
      document.body.style.overflow = "hidden" // Prevent scrolling

      // Add entrance animation class
      settingsModal.classList.add("modal-entering")

      // Trigger animations for modal content
      setTimeout(() => {
        settingsModal.classList.remove("modal-entering")
        settingsModal.classList.add("modal-entered")
      }, 50)

      populateProductAssignmentTable()
      populateProductList()

      // Update column names from the main table
      updateColumnNamesFromTable()
    })
  }

  // Close settings modal with exit animation
  if (closeSettings) {
    closeSettings.addEventListener("click", () => {
      settingsModal.classList.remove("modal-entered")
      settingsModal.classList.add("modal-exiting")

      setTimeout(() => {
        settingsModal.style.display = "none"
        settingsModal.classList.remove("modal-exiting")
        document.body.style.overflow = ""
      }, 300)
    })
  }

  // Close modal when clicking outside with exit animation
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("modal-entered")
      settingsModal.classList.add("modal-exiting")

      setTimeout(() => {
        settingsModal.style.display = "none"
        settingsModal.classList.remove("modal-exiting")
        document.body.style.overflow = ""
      }, 300)
    }
  })

  // Enhanced tab switching with smooth transitions
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the currently active tab
      const activeTab = document.querySelector(".tab-content.active")
      const activeTabId = activeTab.id

      // Get the target tab
      const targetTabId = this.getAttribute("data-tab")
      const targetTab = document.getElementById(targetTabId)

      // Only proceed if we're changing tabs
      if (activeTabId !== targetTabId) {
        // Remove active class from all buttons
        tabButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        this.classList.add("active")

        // Fade out current tab
        activeTab.classList.add("tab-exiting")

        // After fade out, switch tabs and fade in new tab
        setTimeout(() => {
          // Hide all tabs
          tabContents.forEach((content) => {
            content.classList.remove("active")
            content.classList.remove("tab-exiting")
          })

          // Show and animate in the new tab
          targetTab.classList.add("active")
          targetTab.classList.add("tab-entering")

          // Remove animation class after animation completes
          setTimeout(() => {
            targetTab.classList.remove("tab-entering")
          }, 300)
        }, 200)
      }
    })
  })

  // Update column names from the main table
  function updateColumnNamesFromTable() {
    columnData.forEach((column) => {
      const headerCell = document.getElementById(`column-${column.id}`)
      if (headerCell) {
        const input = document.getElementById(`${column.id}-name`)
        if (input) {
          input.value = headerCell.textContent
          column.name = headerCell.textContent
        }
      }
    })
  }

  // Populate product assignment table with enhanced styling and editable prices
  function populateProductAssignmentTable() {
    const tableBody = document.getElementById("product-assignment-body")
    if (!tableBody) return

    tableBody.innerHTML = ""

    // Create table header with editable column names
    const headerRow = document.querySelector(".product-assignment-table thead tr")
    if (headerRow) {
      // Clear existing headers except the first one (Product)
      while (headerRow.children.length > 1) {
        headerRow.removeChild(headerRow.lastChild)
      }

      // Add editable column headers
      columnData.forEach((column) => {
        const th = document.createElement("th")
        th.dataset.columnId = column.id

        // Create editable header
        const headerInput = document.createElement("div")
        headerInput.className = "editable-column-name"
        headerInput.textContent = column.name
        headerInput.contentEditable = true
        headerInput.dataset.originalValue = column.name

        // Add event listeners for editing
        headerInput.addEventListener("focus", function () {
          this.dataset.originalValue = this.textContent.trim()
          this.classList.add("editing")
        })

        headerInput.addEventListener("blur", function () {
          const newValue = this.textContent.trim()
          this.classList.remove("editing")

          if (newValue && newValue !== this.dataset.originalValue) {
            // Update column name
            const columnId = this.parentNode.dataset.columnId
            const column = columnData.find((c) => c.id === columnId)
            if (column) {
              column.name = newValue

              // Update input in column names tab
              const input = document.getElementById(`${columnId}-name`)
              if (input) {
                input.value = newValue
              }

              showToast(`Column renamed to "${newValue}"`)
            }
          } else if (!newValue) {
            // Revert to original if empty
            this.textContent = this.dataset.originalValue
          }
        })

        headerInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault()
            this.blur()
          } else if (e.key === "Escape") {
            e.preventDefault()
            this.textContent = this.dataset.originalValue
            this.blur()
          }
        })

        th.appendChild(headerInput)
        headerRow.appendChild(th)
      })
    }

    // Sort products for consistent order
    const sortedProducts = [...availableProducts].sort((a, b) => a.name.localeCompare(b.name))

    // Add products to the table with drag and drop functionality
    sortedProducts.forEach((product, index) => {
      const row = document.createElement("tr")
      row.dataset.productId = product.id
      row.draggable = true

      // Add drag and drop functionality to rows
      row.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", product.id)
        this.classList.add("dragging")

        // Store the original index for reordering
        this.dataset.originalIndex = Array.from(this.parentNode.children).indexOf(this)
      })

      row.addEventListener("dragend", function () {
        this.classList.remove("dragging")
      })

      row.addEventListener("dragover", function (e) {
        e.preventDefault()
        const draggingRow = document.querySelector("tr.dragging")
        if (draggingRow && draggingRow !== this) {
          const container = this.parentNode
          const afterElement = getDragAfterElement(container, e.clientY)

          if (afterElement) {
            container.insertBefore(draggingRow, afterElement)
          } else {
            container.appendChild(draggingRow)
          }
        }
      })

      // Add staggered animation delay
      row.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`
      row.style.opacity = "0"

      // Product name cell
      const nameCell = document.createElement("td")

      // Create a more detailed product display
      const productInfo = document.createElement("div")
      productInfo.className = "product-info"

      const productName = document.createElement("div")
      productName.className = "product-table-name"
      productName.textContent = product.name

      // Create editable price input with improved UX
      const productValueContainer = document.createElement("div")
      productValueContainer.className = "product-table-value-container"

      const currencySymbol = document.createElement("span")
      currencySymbol.className = "currency-symbol"
      currencySymbol.textContent = "$"

      const productValueInput = document.createElement("input")
      productValueInput.type = "text"
      productValueInput.className = "product-table-value-input"
      productValueInput.value = product.value
      productValueInput.dataset.productId = product.id
      productValueInput.dataset.originalValue = product.value
      productValueInput.title = "Click to edit price"
      productValueInput.setAttribute("aria-label", `Edit price for ${product.name}`)

      // Add event listeners for price editing with improved feedback
      productValueInput.addEventListener("focus", function () {
        this.select()
        productValueContainer.classList.add("editing")
      })

      productValueInput.addEventListener("blur", function () {
        const newValue = this.value.trim()
        const originalValue = this.dataset.originalValue
        productValueContainer.classList.remove("editing")

        if (newValue && !isNaN(Number.parseFloat(newValue))) {
          // Update product value
          const productId = this.dataset.productId
          const product = availableProducts.find((p) => p.id === productId)
          if (product) {
            const formattedValue = Number.parseFloat(newValue).toFixed(2)
            product.value = formattedValue
            this.value = formattedValue
            this.dataset.originalValue = formattedValue

            // Only show toast and animation if value actually changed
            if (originalValue !== formattedValue) {
              showToast(`Price updated for ${product.name}`)
              productValueContainer.classList.add("value-updated")
              setTimeout(() => {
                productValueContainer.classList.remove("value-updated")
              }, 1000)
            }
          }
        } else {
          // Revert to original value if invalid
          this.value = this.dataset.originalValue
          showToast("Please enter a valid price", true)
        }
      })

      productValueInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          this.blur()
        } else if (e.key === "Escape") {
          this.value = this.dataset.originalValue
          this.blur()
        }
      })

      // Add click handler to the container to focus the input
      productValueContainer.addEventListener("click", (e) => {
        if (e.target !== productValueInput) {
          productValueInput.focus()
        }
      })

      productValueContainer.appendChild(currencySymbol)
      productValueContainer.appendChild(productValueInput)

      productInfo.appendChild(productName)
      productInfo.appendChild(productValueContainer)
      nameCell.appendChild(productInfo)

      row.appendChild(nameCell)

      // Column cells with toggles
      columnData.forEach((column) => {
        const cell = document.createElement("td")
        cell.className = "toggle-cell"

        const label = document.createElement("label")
        label.className = "toggle-switch"

        const input = document.createElement("input")
        input.type = "checkbox"
        input.checked = column.products.includes(product.id)
        input.dataset.productId = product.id
        input.dataset.columnId = column.id

        // Add custom color class based on column
        label.classList.add(`${column.id}-toggle`)

        input.addEventListener("change", function () {
          toggleProductInColumn.call(this)

          // Add ripple effect on toggle
          const ripple = document.createElement("span")
          ripple.className = "toggle-ripple"
          label.appendChild(ripple)

          // Remove ripple after animation
          setTimeout(() => {
            label.removeChild(ripple)
          }, 600)
        })

        const slider = document.createElement("span")
        slider.className = "toggle-slider"

        label.appendChild(input)
        label.appendChild(slider)
        cell.appendChild(label)
        row.appendChild(cell)
      })

      tableBody.appendChild(row)
    })
  }

  // Helper function for drag and drop reordering
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("tr:not(.dragging)")]

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element
  }

  // Toggle product in column with visual feedback
  function toggleProductInColumn() {
    const productId = this.dataset.productId
    const columnId = this.dataset.columnId
    const isChecked = this.checked

    // Update columnData
    const column = columnData.find((col) => col.id === columnId)
    if (isChecked) {
      // Add product to column if not already there
      if (!column.products.includes(productId)) {
        column.products.push(productId)

        // Show success toast
        const product = availableProducts.find((p) => p.id === productId)
        showToast(`Added ${product.name} to ${column.name} plan`)
      }
    } else {
      // Remove product from column
      column.products = column.products.filter((id) => id !== productId)

      // Show info toast
      const product = availableProducts.find((p) => p.id === productId)
      showToast(`Removed ${product.name} from ${column.name} plan`, false, "info-toast")
    }
  }

  // Populate product list with enhanced animations
  function populateProductList() {
    const productList = document.getElementById("product-list")
    if (!productList) return

    productList.innerHTML = ""

    availableProducts.forEach((product, index) => {
      const productItem = document.createElement("div")
      productItem.className = "product-item"
      productItem.dataset.productId = product.id

      // Add staggered animation delay
      productItem.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`
      productItem.style.opacity = "0"

      const productInfo = document.createElement("div")
      productInfo.className = "product-info"

      const productName = document.createElement("div")
      productName.className = "product-name"
      productName.textContent = product.name

      const productValue = document.createElement("div")
      productValue.className = "product-value"
      productValue.textContent = `$${product.value}`

      productInfo.appendChild(productName)
      productInfo.appendChild(productValue)

      const actionButtons = document.createElement("div")
      actionButtons.className = "product-actions"

      const editButton = document.createElement("button")
      editButton.className = "edit-product"
      editButton.innerHTML = '<i class="bi bi-pencil"></i>'
      editButton.addEventListener("click", () => {
        editProduct(product.id)
      })

      const deleteButton = document.createElement("button")
      deleteButton.className = "delete-product"
      deleteButton.innerHTML = '<i class="bi bi-trash"></i>'
      deleteButton.addEventListener("click", () => {
        // Add confirmation with animation
        if (!productItem.classList.contains("confirm-delete")) {
          productItem.classList.add("confirm-delete")
          deleteButton.innerHTML = '<i class="bi bi-check-circle"></i>'

          // Add cancel button
          const cancelButton = document.createElement("button")
          cancelButton.className = "cancel-delete"
          cancelButton.innerHTML = '<i class="bi bi-x-circle"></i>'
          cancelButton.addEventListener("click", (e) => {
            e.stopPropagation()
            productItem.classList.remove("confirm-delete")
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>'
            actionButtons.removeChild(cancelButton)
          })

          actionButtons.insertBefore(cancelButton, deleteButton)

          // Auto-cancel after 3 seconds
          setTimeout(() => {
            if (productItem.classList.contains("confirm-delete") && productItem.parentNode) {
              productItem.classList.remove("confirm-delete")
              deleteButton.innerHTML = '<i class="bi bi-trash"></i>'
              if (actionButtons.contains(cancelButton)) {
                actionButtons.removeChild(cancelButton)
              }
            }
          }, 3000)
        } else {
          deleteProduct(product.id)
        }
      })

      actionButtons.appendChild(editButton)
      actionButtons.appendChild(deleteButton)

      productItem.appendChild(productInfo)
      productItem.appendChild(actionButtons)
      productList.appendChild(productItem)
    })
  }

  // Edit product function
  function editProduct(productId) {
    const product = availableProducts.find((p) => p.id === productId)
    if (!product) return

    // Find the product item in the DOM
    const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`)
    if (!productItem) return

    // Check if already in edit mode
    if (productItem.classList.contains("editing")) return

    // Store original content
    const originalContent = productItem.innerHTML
    productItem.classList.add("editing")

    // Create edit form
    const editForm = document.createElement("div")
    editForm.className = "product-edit-form"

    const nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.className = "edit-product-name"
    nameInput.value = product.name
    nameInput.placeholder = "Product Name"

    const valueInput = document.createElement("input")
    valueInput.type = "text"
    valueInput.className = "edit-product-value"
    valueInput.value = product.value
    valueInput.placeholder = "Value (e.g. 500.00)"

    const buttonGroup = document.createElement("div")
    buttonGroup.className = "edit-buttons"

    const saveButton = document.createElement("button")
    saveButton.className = "save-edit"
    saveButton.innerHTML = '<i class="bi bi-check"></i> Save'

    const cancelButton = document.createElement("button")
    cancelButton.className = "cancel-edit"
    cancelButton.innerHTML = '<i class="bi bi-x"></i> Cancel'

    buttonGroup.appendChild(saveButton)
    buttonGroup.appendChild(cancelButton)

    editForm.appendChild(nameInput)
    editForm.appendChild(valueInput)
    editForm.appendChild(buttonGroup)

    // Clear and add edit form
    productItem.innerHTML = ""
    productItem.appendChild(editForm)

    // Focus on name input
    nameInput.focus()

    // Save button event
    saveButton.addEventListener("click", () => {
      const newName = nameInput.value.trim()
      const newValue = valueInput.value.trim()

      if (newName && newValue) {
        // Update product data
        product.name = newName
        product.value = newValue

        // Exit edit mode
        productItem.classList.remove("editing")

        // Refresh product list
        populateProductList()
        populateProductAssignmentTable()

        // Show success toast
        showToast(`Product updated successfully`)
      } else {
        // Show error toast
        showToast("Please fill in all fields", true)

        // Shake animation for validation
        editForm.classList.add("validation-error")
        setTimeout(() => {
          editForm.classList.remove("validation-error")
        }, 500)
      }
    })

    // Cancel button event
    cancelButton.addEventListener("click", () => {
      productItem.classList.remove("editing")
      productItem.innerHTML = originalContent

      // Re-attach event listeners
      const newDeleteBtn = productItem.querySelector(".delete-product")
      if (newDeleteBtn) {
        newDeleteBtn.addEventListener("click", () => deleteProduct(productId))
      }

      const newEditBtn = productItem.querySelector(".edit-product")
      if (newEditBtn) {
        newEditBtn.addEventListener("click", () => editProduct(productId))
      }
    })
  }

  // Delete product with animation
  function deleteProduct(productId) {
    // Find the product item in the DOM
    const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`)

    if (productItem) {
      // Add exit animation
      productItem.classList.add("deleting")

      // Wait for animation to complete
      setTimeout(() => {
        // Find the product to be deleted
        const index = availableProducts.findIndex((p) => p.id === productId)
        if (index !== -1) {
          const deletedProduct = availableProducts[index]

          // Remove from availableProducts
          availableProducts.splice(index, 1)

          // Remove from all columns
          columnData.forEach((column) => {
            column.products = column.products.filter((id) => id !== productId)
          })

          // Update UI
          populateProductList()
          populateProductAssignmentTable()

          // Show toast
          showToast(`${deletedProduct.name} deleted successfully`)
        }
      }, 300)
    }
  }

  // Add new product with enhanced validation and animation
  const addProductBtn = document.getElementById("add-product-btn")
  const newProductNameInput = document.getElementById("new-product-name")

  // Create value input if it doesn't exist
  let newProductValueInput = document.getElementById("new-product-value")

  if (!newProductValueInput && addProductBtn) {
    newProductValueInput = document.createElement("input")
    newProductValueInput.id = "new-product-value"
    newProductValueInput.className = "column-name-input"
    newProductValueInput.placeholder = "Enter value (e.g. 500.00)"

    // Create label for value input
    const valueLabel = document.createElement("label")
    valueLabel.htmlFor = "new-product-value"
    valueLabel.textContent = "Product Value ($):"

    // Create input group for value
    const valueGroup = document.createElement("div")
    valueGroup.className = "input-group"
    valueGroup.appendChild(valueLabel)
    valueGroup.appendChild(newProductValueInput)

    // Add to form
    const addProductForm = document.querySelector(".add-product-form")
    if (addProductForm) {
      addProductForm.insertBefore(valueGroup, addProductBtn)
    }
  }
  // Enhanced validation for inputs
  ;[newProductNameInput, newProductValueInput].forEach((input) => {
    if (!input) return

    input.addEventListener("input", function () {
      validateInput(this)
    })

    input.addEventListener("blur", function () {
      validateInput(this, true)
    })
  })

  function validateInput(input, showError = false) {
    const value = input.value.trim()

    if (!value && showError) {
      input.classList.add("input-error")

      // Add error message if it doesn't exist
      let errorMsg = input.nextElementSibling
      if (!errorMsg || !errorMsg.classList.contains("error-message")) {
        errorMsg = document.createElement("div")
        errorMsg.className = "error-message"
        errorMsg.textContent = "This field is required"
        input.parentNode.insertBefore(errorMsg, input.nextSibling)
      }
    } else {
      input.classList.remove("input-error")

      // Remove error message if it exists
      const errorMsg = input.nextElementSibling
      if (errorMsg && errorMsg.classList.contains("error-message")) {
        input.parentNode.removeChild(errorMsg)
      }
    }

    return !!value
  }

  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      const productName = newProductNameInput.value.trim()
      const productValue = newProductValueInput ? newProductValueInput.value.trim() : "0.00"

      // Validate inputs
      const nameValid = validateInput(newProductNameInput, true)
      const valueValid = newProductValueInput ? validateInput(newProductValueInput, true) : true

      if (nameValid && valueValid) {
        // Add button press animation
        addProductBtn.classList.add("button-pressed")

        setTimeout(() => {
          addProductBtn.classList.remove("button-pressed")

          // Generate new ID
          const newId = "p" + (availableProducts.length + 1)

          // Add to availableProducts
          availableProducts.push({ id: newId, name: productName, value: productValue })

          // Clear inputs
          newProductNameInput.value = ""
          if (newProductValueInput) newProductValueInput.value = ""

          // Update UI
          populateProductList()
          populateProductAssignmentTable()

          // Show toast
          showToast(`${productName} added successfully`)
        }, 200)
      } else {
        // Shake the form for invalid inputs
        const addProductForm = document.querySelector(".add-product-form")
        if (addProductForm) {
          addProductForm.classList.add("validation-error")
          setTimeout(() => {
            addProductForm.classList.remove("validation-error")
          }, 500)
        }

        showToast("Please fill in all required fields", true)
      }
    })
  }

  // Initialize payment term months dropdown
  function initializePaymentTerms() {
    // Define available term options
    const termOptions = [36, 48, 60, 63, 72, 75, 84]

    // Find all price term elements
    const priceTerms = document.querySelectorAll(".price-term")

    priceTerms.forEach((termElement, index) => {
      // Get the column ID from the parent elements
      const columnCell = termElement.closest("td")
      if (!columnCell) return

      const columnPlan = columnCell.querySelector(".kanban-dropzone")?.getAttribute("data-plan")
      if (!columnPlan) return

      // Get or set default term months for this column
      const column = columnData.find((col) => col.id === columnPlan)
      if (!column) return

      if (!column.termMonths) {
        // Try to extract the current term from the element text
        const currentText = termElement.textContent.trim()
        const monthsMatch = currentText.match(/(\d+)\s+months/i)
        column.termMonths = monthsMatch ? Number.parseInt(monthsMatch[1]) : 60 // Default to 60 months if not found
      }

      // Create dropdown container
      const dropdownContainer = document.createElement("div")
      dropdownContainer.className = "term-dropdown-container"

      // Create dropdown label
      const dropdownLabel = document.createElement("span")
      dropdownLabel.className = "term-dropdown-label"
      dropdownLabel.textContent = "for "

      // Create dropdown
      const dropdown = document.createElement("div")
      dropdown.className = "term-dropdown"

      // Create selected value display
      const selectedValue = document.createElement("span")
      selectedValue.className = "term-selected-value"
      selectedValue.textContent = `${column.termMonths} months`
      selectedValue.dataset.value = column.termMonths

      // Create dropdown icon
      const dropdownIcon = document.createElement("i")
      dropdownIcon.className = "bi bi-chevron-down term-dropdown-icon"

      // Create dropdown options container
      const optionsContainer = document.createElement("div")
      optionsContainer.className = "term-dropdown-options"

      // Add options
      termOptions.forEach((months) => {
        const option = document.createElement("div")
        option.className = "term-dropdown-option"
        option.textContent = `${months} months`
        option.dataset.value = months

        if (months === column.termMonths) {
          option.classList.add("selected")
        }

        option.addEventListener("click", function () {
          // Update selected value
          selectedValue.textContent = this.textContent
          selectedValue.dataset.value = this.dataset.value

          // Update column data
          column.termMonths = Number.parseInt(this.dataset.value)

          // Update selected option
          optionsContainer.querySelectorAll(".term-dropdown-option").forEach((opt) => {
            opt.classList.remove("selected")
          })
          this.classList.add("selected")

          // Close dropdown
          optionsContainer.classList.remove("show")

          // Show toast
          showToast(`Updated ${column.name} plan to ${this.textContent}`, false, "info-toast")

          // Save to localStorage
          try {
            localStorage.setItem("columnData", JSON.stringify(columnData))
          } catch (e) {
            console.warn("Could not save term months to localStorage:", e)
          }
        })

        optionsContainer.appendChild(option)
      })

      // Toggle dropdown on click
      dropdown.addEventListener("click", (e) => {
        e.stopPropagation()
        optionsContainer.classList.toggle("show")
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        optionsContainer.classList.remove("show")
      })

      // Assemble dropdown
      dropdown.appendChild(selectedValue)
      dropdown.appendChild(dropdownIcon)
      dropdown.appendChild(optionsContainer)

      dropdownContainer.appendChild(dropdownLabel)
      dropdownContainer.appendChild(dropdown)

      // Replace the original term element content
      termElement.innerHTML = ""
      termElement.appendChild(dropdownContainer)
    })
  }

  // Save settings with enhanced animation and feedback
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      // Add button press animation
      saveSettingsBtn.classList.add("button-pressed")
      saveSettingsBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...'

      setTimeout(() => {
        // Update column names
        columnData.forEach((column) => {
          const input = document.getElementById(`${column.id}-name`)
          if (input) {
            column.name = input.value

            // Update column header in the main table
            const columnHeader = document.getElementById(`column-${column.id}`)
            if (columnHeader) {
              // Add animation to header update
              columnHeader.classList.add("updating")
              columnHeader.textContent = column.name

              setTimeout(() => {
                columnHeader.classList.remove("updating")
              }, 500)
            }
          }
        })

        // Update the actual menu items based on product assignments
        updateMenuItems()

        // Save settings to localStorage for persistence
        try {
          localStorage.setItem("columnData", JSON.stringify(columnData))
          localStorage.setItem("availableProducts", JSON.stringify(availableProducts))
        } catch (e) {
          console.warn("Could not save settings to localStorage:", e)
        }

        // Reset button state
        saveSettingsBtn.classList.remove("button-pressed")
        saveSettingsBtn.innerHTML = '<i class="bi bi-check-circle"></i> Save Settings'

        // Close modal with exit animation
        settingsModal.classList.remove("modal-entered")
        settingsModal.classList.add("modal-exiting")

        setTimeout(() => {
          settingsModal.style.display = "none"
          settingsModal.classList.remove("modal-exiting")
          document.body.style.overflow = ""
        }, 300)

        // Show toast with success animation
        showToast("Settings saved successfully", false, "success-toast")
      }, 800) // Simulate saving delay for better UX
    })
  }

  // Add function to load saved settings on page load
  function loadSavedSettings() {
    try {
      const savedColumnData = localStorage.getItem("columnData")
      const savedProducts = localStorage.getItem("availableProducts")

      if (savedColumnData) {
        columnData = JSON.parse(savedColumnData)

        // Update column headers
        columnData.forEach((column) => {
          const headerCell = document.getElementById(`column-${column.id}`)
          if (headerCell) {
            headerCell.textContent = column.name
          }
        })
      }

      if (savedProducts) {
        availableProducts = JSON.parse(savedProducts)
      }

      // Update the menu items based on saved settings
      updateMenuItems()

      // Update payment term dropdowns
      initializePaymentTerms()
    } catch (e) {
      console.warn("Could not load saved settings:", e)
    }
  }

  // Function to update menu items based on settings
  function updateMenuItems() {
    // Update each column's feature list
    columnData.forEach((column) => {
      // Get the feature list for this column
      const featureList = document.querySelector(`.kanban-dropzone[data-plan="${column.id}"]`)
      if (!featureList) return

      // Clear existing items
      featureList.innerHTML = ""

      // Add products assigned to this column
      column.products.forEach((productId) => {
        const product = availableProducts.find((p) => p.id === productId)
        if (!product) return

        // Create new feature item
        const featureItem = document.createElement("li")
        featureItem.className = "feature-item"
        featureItem.draggable = true
        featureItem.dataset.id = productId
        featureItem.dataset.plan = column.id

        const featureContent = document.createElement("div")
        featureContent.className = "feature-content"

        const checkmark = document.createElement("span")
        checkmark.className = `feature-check ${column.id}-check`
        checkmark.textContent = "✓"

        const productName = document.createElement("span")
        productName.textContent = product.name

        featureContent.appendChild(checkmark)
        featureContent.appendChild(productName)
        featureItem.appendChild(featureContent)

        // Add to feature list
        featureList.appendChild(featureItem)

        // Set up drag listeners
        setupDragListeners(featureItem)
      })
    })
  }

  // Enhanced toast notification with types and animations
  function showToast(message, isError = false, customClass = "") {
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toast-message")

    if (!toast || !toastMessage) return

    toastMessage.textContent = message

    // Reset classes
    toast.className = "toast"
    if (customClass) {
      toast.classList.add(customClass)
    }

    const toastIcon = document.querySelector(".toast-icon")
    if (toastIcon) {
      if (isError) {
        toast.style.borderLeftColor = "var(--gold-color)"
        toastIcon.style.color = "var(--gold-color)"
        toastIcon.className = "bi bi-exclamation-circle toast-icon"
      } else {
        toast.style.borderLeftColor = "var(--platinum-color)"
        toastIcon.style.color = "var(--platinum-color)"
        toastIcon.className = "bi bi-check-circle toast-icon"
      }
    }

    // Add show class with animation
    toast.classList.add("show")

    // Reset any existing timeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId)
    }

    // Hide toast after 3 seconds
    toast.timeoutId = setTimeout(() => {
      toast.classList.add("hiding")

      setTimeout(() => {
        toast.classList.remove("show")
        toast.classList.remove("hiding")
      }, 300)
    }, 3000)
  }

  // Add keyboard shortcuts for accessibility
  document.addEventListener("keydown", (e) => {
    // ESC key to close modal
    if (e.key === "Escape" && settingsModal && settingsModal.style.display === "block") {
      if (closeSettings) closeSettings.click()
    }

    // Ctrl+S to save settings when modal is open
    if (e.ctrlKey && e.key === "s" && settingsModal && settingsModal.style.display === "block") {
      e.preventDefault()
      if (saveSettingsBtn) saveSettingsBtn.click()
    }
  })

  // Load saved settings and initialize payment terms dropdown
  loadSavedSettings()
  initializePaymentTerms()
})

