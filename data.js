const transformationData = [
    // --- IMAGES ---
    {
        id: 'occlusion',
        category: 'obfuscation',
        type: 'image',
        name: 'Occlusion',
        input: 'images/original.jpg',
        output: 'images/occlusion.png',
        metrics: { semantic: 80, trigger: 0, smoothness: 10 },
        description: "<strong>Occlusion</strong>: Draws a solid shape over the sensitive region. Minimizes trigger fidelity (high safety) but has very low smoothness (looks edited) and hides local information."
    },
    {
        id: 'blur',
        category: 'obfuscation',
        type: 'image',
        name: 'Blur',
        input: 'images/original.jpg',
        output: 'images/blur.png',
        metrics: { semantic: 85, trigger: 20, smoothness: 50 },
        description: "<strong>Blur</strong>: Softens the sensitive region. Reduces trigger details while potentially retaining color/shape context. Smoother than occlusion but still visibly edited."
    },
    {
        id: 'inpainting',
        category: 'semantic',
        type: 'image',
        name: 'Inpainting',
        input: 'images/original.jpg',
        output: 'images/inpainting.png',
        metrics: { semantic: 40, trigger: 5, smoothness: 95 },
        description: "<strong>Inpainting</strong>: Removes the object and reconstructs the background. Extremely smooth and natural-looking, but significantly alters the reality/truth of the image (low semantic fidelity)."
    },
    {
        id: 'replacement',
        category: 'semantic',
        type: 'image',
        name: 'Visual Euphemism',
        input: 'images/original.jpg',
        output: 'images/replacement.png',
        metrics: { semantic: 30, trigger: 0, smoothness: 90 },
        description: "<strong>Visual Euphemism</strong>: Replaces the triggering object with a benign alternative (e.g., a flower). Maintains high smoothness and composition but changes the meaning."
    },
    {
        id: 'pointillism',
        category: 'stylistic',
        type: 'image',
        name: 'Pointillism',
        input: 'images/original.jpg',
        output: 'images/download (15)_pointillism.png',
        metrics: { semantic: 70, trigger: 40, smoothness: 60 },
        description: "<strong>Pointillism</strong>: Applies a dot-based artistic style. A 'middle ground' that reduces realism (lowering trigger intensity) while keeping the structural context visible."
    },
    {
        id: 'ghibli',
        category: 'stylistic',
        type: 'image',
        name: 'Studio Ghibli',
        input: 'images/original.jpg',
        output: 'images/ghibli.png',
        metrics: { semantic: 65, trigger: 30, smoothness: 75 },
        description: "<strong>Studio Ghibli Style</strong>: A whimsical, animated style. Reduces the harshness of reality using warmer colors and softer edges, lending a tone of warmth."
    },

    // --- TEXT ---
    {
        id: 'text-blur',
        category: 'text-obfuscation', 
        type: 'text',
        name: 'Blur Words',
        input: "The comments on her post were absolutely vicious and hateful.",
        output: "The comments on her post were absolutely ██████ and ██████.",
        metrics: { semantic: 80, trigger: 10, smoothness: 20 },
        description: "<strong>Text Blurring</strong>: Obscures specific triggering words. Preserves sentence structure (Semantic Fidelity) but breaks reading flow (Low Smoothness)."
    },
    {
        id: 'text-rewrite',
        category: 'text-semantic',
        type: 'text',
        name: 'Rephrasing',
        input: "The comments on her post were absolutely vicious and hateful.",
        output: "The comments on her post were very negative and critical.",
        metrics: { semantic: 60, trigger: 20, smoothness: 90 },
        description: "<strong>Rephrasing (LLM)</strong>: Rewrites the content to convey similar meaning in a softer tone. High smoothness, but loses the original intensity/nuance."
    },
    {
        id: 'text-warning',
        category: 'text-warning',
        type: 'text',
        name: 'Overlay Warning',
        input: "The comments on her post were absolutely vicious and hateful.",
        // The output here contains HTML structured for the interaction script
        output: `<div class="warning-wrapper">
                    <div class="warning-cover">
                        <i class="fas fa-eye-slash"></i> 
                        <strong>Content Warning:</strong> Toxic Language<br>
                        <span style="font-size:0.8em; opacity:0.8">(Hidden based on your preferences)</span>
                        <div style="margin-top:0.5rem; font-size:0.8em; text-decoration:underline;">Click to Reveal</div>
                    </div>
                    <div class="warning-content">The comments on her post were absolutely vicious and hateful.</div>
                 </div>`,
        metrics: { semantic: 100, trigger: 0, smoothness: 40 },
        description: "<strong>Overlay Warning</strong>: Covers the content with a warning label based on your specific safety preferences. Minimizes initial exposure effectively."
    }
];