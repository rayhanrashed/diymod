let currentMode = 'image'; // 'image' or 'text'
let currentCategory = 'obfuscation'; // for image mode
let currentTransformationId = null;

function initExplorer() {
  // 1. Mode Toggle logic
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      updateInterfaceForMode();
    });
  });

  // 2. Category Tabs (Image Mode only)
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderButtons();
    });
  });

  // 3. New Card Expansion Logic (Findings & Scenarios)
  // Replaces the old '.finding-card' logic
  document.querySelectorAll('.expand-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Toggle 'open' class on the clicked card
      card.classList.toggle('open');
    });
  });

  // 4. Delegate click for "Overlay Warning" Reveal
  // We attach this to the container because the warning element is created dynamically
  const visualContainer = document.getElementById('tradeoff-visual-container');
  if (visualContainer) {
    visualContainer.addEventListener('click', (e) => {
        // Check if the click occurred inside the warning wrapper
        const wrapper = e.target.closest('.warning-wrapper');
        if (wrapper) {
            wrapper.classList.add('revealed');
        }
    });
  }

  // Initial Render
  updateInterfaceForMode();
}

function updateInterfaceForMode() {
  // Show/Hide Category Tabs based on mode
  const tabContainer = document.getElementById('category-tabs');
  if (currentMode === 'image') {
    tabContainer.style.display = 'flex';
  } else {
    tabContainer.style.display = 'none';
  }
  renderButtons();
}

function renderButtons() {
  const btnContainer = document.getElementById('tradeoff-btn-group');
  btnContainer.innerHTML = '';

  let items = [];
  if (currentMode === 'image') {
    // Filter by current category
    items = transformationData.filter(item => item.type === 'image' && item.category === currentCategory);
  } else {
    // All text transformations
    items = transformationData.filter(item => item.type === 'text');
  }

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'tradeoff-btn';
    if (item.id === currentTransformationId) btn.classList.add('active');
    btn.textContent = item.name;
    
    // Use an arrow function to pass the specific ID
    btn.onclick = (e) => {
        e.stopPropagation(); 
        selectTransformation(item.id);
    };
    btnContainer.appendChild(btn);
  });

  // Auto-select first if none selected or invalid
  const exists = items.find(i => i.id === currentTransformationId);
  if (items.length > 0 && (!currentTransformationId || !exists)) {
    selectTransformation(items[0].id);
  }
}

function selectTransformation(id) {
  currentTransformationId = id;
  const data = transformationData.find(i => i.id === id);
  if (!data) return;

  // Update Buttons UI
  document.querySelectorAll('.tradeoff-btn').forEach(btn => {
    if (btn.textContent === data.name) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Update Visuals
  const visualContainer = document.getElementById('tradeoff-visual-container');
  visualContainer.innerHTML = '';

  if (data.type === 'image') {
    const img = document.createElement('img');
    img.src = data.output;
    img.alt = data.name + " Result";
    img.style.opacity = 0;
    img.style.transition = "opacity 0.3s";
    visualContainer.appendChild(img);
    // Smooth fade-in
    setTimeout(() => img.style.opacity = 1, 50);
  } else {
    // Create text container
    const textBox = document.createElement('div');
    textBox.className = 'text-demo';
    
    // Check if it's the specific 'text-warning' case.
    // We treat this differently because 'data.output' already contains HTML elements 
    // for the interactive overlay (defined in data.js).
    if(data.id === 'text-warning') {
        textBox.innerHTML = `
            <div style="margin-bottom:1rem; color:#666; font-size:0.9rem;">ORIGINAL</div>
            <div style="margin-bottom:1.5rem; padding-left:1rem; border-left:3px solid #eee;">"${data.input}"</div>
            <div style="margin-bottom:1rem; color:#2c3e50; font-weight:600; font-size:0.9rem;">TRANSFORMED</div>
            ${data.output}`; 
    } else {
        // Standard formatting for other text transformations
        textBox.innerHTML = `
            <div style="margin-bottom:1rem; color:#666; font-size:0.9rem;">ORIGINAL</div>
            <div style="margin-bottom:1.5rem; padding-left:1rem; border-left:3px solid #eee;">"${data.input}"</div>
            <div style="margin-bottom:1rem; color:#2c3e50; font-weight:600; font-size:0.9rem;">TRANSFORMED</div>
            <div style="padding-left:1rem; border-left:3px solid var(--accent-color);">${data.output}</div>`;
    }
    
    visualContainer.appendChild(textBox);
  }

  // Update Metrics
  updateBar('bar-semantic', data.metrics.semantic);
  updateBar('bar-trigger', data.metrics.trigger);
  updateBar('bar-smoothness', data.metrics.smoothness);

  // Update Description
  const desc = document.getElementById('tradeoff-desc');
  if (desc) desc.innerHTML = data.description;
}

function updateBar(id, value) {
  const bar = document.getElementById(id);
  if (bar) {
    bar.style.width = value + '%';
    // Color coding logic
    if (value >= 80) bar.style.backgroundColor = '#2ecc71';      // green
    else if (value <= 40) bar.style.backgroundColor = '#e74c3c'; // red
    else bar.style.backgroundColor = '#3498db';                  // blue
  }
}

// Initialize on window load
window.addEventListener('load', initExplorer);