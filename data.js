const transformationData = [
    // --- IMAGES ---
    // Based on Section 4.4 of the paper:
    // - Obfuscation prioritizes immediate reduction of trigger fidelity
    // - Semantic modifications prioritize perceptual smoothness at cost of semantic fidelity
    // - Stylistic alterations offer a middle ground
    {
        id: 'occlusion',
        category: 'obfuscation',
        type: 'image',
        name: 'Occlusion',
        input: 'images/original.jpg',
        output: 'images/occlusion.jpg',
        metrics: { semantic: 65, trigger: 15, smoothness: 15 },
        description: "<strong>Occlusion</strong>: Draws a solid shape over the sensitive region. Preserves surrounding context (high semantic fidelity), eliminates trigger completely (very low trigger fidelity), but looks jarring (low smoothness)."
    },
    {
        id: 'blur',
        category: 'obfuscation',
        type: 'image',
        name: 'Blur',
        input: 'images/original.jpg',
        output: 'images/blur.jpg',
        metrics: { semantic: 80, trigger: 50, smoothness: 40 },
        description: "<strong>Blur</strong>: Softens the sensitive region. Retains color/shape context while reducing trigger details. Smoother than occlusion but still visibly edited."
    },
    {
        id: 'inpainting',
        category: 'semantic',
        type: 'image',
        name: 'Inpainting',
        input: 'images/original.jpg',
        output: 'images/inpainting.jpg',
        metrics: { semantic: 30, trigger: 5, smoothness: 95 },
        description: "<strong>Inpainting</strong>: Removes the object and reconstructs the background. Creates a new plausible reality where the object never existed—very smooth but significantly alters semantic truth."
    },
    {
        id: 'replacement',
        category: 'semantic',
        type: 'image',
        name: 'Visual Euphemism',
        input: 'images/original.jpg',
        output: 'images/replacement.jpg',
        metrics: { semantic: 25, trigger: 5, smoothness: 85 },
        description: "<strong>Visual Euphemism</strong>: Replaces the triggering object with a benign alternative. Produces a visually coherent image but changes the meaning substantially."
    },
    {
        id: 'pointillism',
        category: 'stylistic',
        type: 'image',
        name: 'Pointillism',
        input: 'images/original.jpg',
        output: 'images/download (15)_pointillism.png',
        metrics: { semantic: 70, trigger: 45, smoothness: 65 },
        description: "<strong>Pointillism</strong>: Applies a dot-based artistic style. A middle ground—reduces photorealism (lowering trigger intensity) while keeping structural context visible."
    },
    {
        id: 'ghibli',
        category: 'stylistic',
        type: 'image',
        name: 'Studio Ghibli',
        input: 'images/original.jpg',
        output: 'images/ghibli.jpg',
        metrics: { semantic: 70, trigger: 35, smoothness: 70 },
        description: "<strong>Studio Ghibli Style</strong>: Whimsical, animated rendering. Reduces harshness of reality with warmer colors and softer edges, lending a tone of warmth while preserving structure."
    },

    // --- TEXT ---
    // Examples contextualized for eating disorder filter:
    // "I have an eating disorder that I'm trying to manage. Food pictures trigger cravings and obsessive thoughts I can't control."
    // Based on Table 2: Blurring preserves structure, Rewrite preserves meaning, Overlay hides entirely
    {
        id: 'text-blur',
        category: 'text-obfuscation', 
        type: 'text',
        name: 'Blur Words',
        input: "Just finished meal prepping! Made the most amazing pasta with creamy alfredo sauce and garlic bread on the side.",
        output: "Just finished meal prepping! Made the most amazing ████ with creamy ██████ █████ and ██████ █████ on the side.",
        metrics: { semantic: 85, trigger: 10, smoothness: 25 },
        description: "<strong>Text Blurring</strong>: Obscures specific food-related words. Preserves sentence structure (high semantic fidelity) but breaks reading flow (low smoothness)."
    },
    {
        id: 'text-rewrite',
        category: 'text-semantic',
        type: 'text',
        name: 'Rephrasing',
        input: "The restaurant's signature dessert was incredible—a rich chocolate lava cake with vanilla ice cream that melted into warm fudge.",
        output: "The restaurant's signature dish was very well-received by the group.",
        metrics: { semantic: 55, trigger: 15, smoothness: 90 },
        description: "<strong>Rephrasing (LLM)</strong>: Rewrites to convey the social context while removing triggering food descriptions. High smoothness but loses original detail."
    },
    {
        id: 'text-warning',
        category: 'text-warning',
        type: 'text',
        name: 'Overlay Warning',
        input: "RECIPE: The Best Homemade Pizza Dough! 🍕 Crispy outside, chewy inside. After years of testing, I finally perfected this recipe. The secret is letting the dough cold ferment for 72 hours...",
        // The output here contains HTML structured for the interaction script
        output: `<div class="warning-wrapper">
                    <div class="warning-cover">
                        <i class="fas fa-eye-slash"></i> 
                        <strong>Content Warning:</strong> Food/Recipe Content<br>
                        <span style="font-size:0.8em; opacity:0.8">(Hidden based on your eating disorder filter)</span>
                        <div style="margin-top:0.5rem; font-size:0.8em; text-decoration:underline;">Click to Reveal</div>
                    </div>
                    <div class="warning-content">RECIPE: The Best Homemade Pizza Dough! 🍕 Crispy outside, chewy inside. After years of testing, I finally perfected this recipe. The secret is letting the dough cold ferment for 72 hours...</div>
                 </div>`,
        metrics: { semantic: 95, trigger: 0, smoothness: 35 },
        description: "<strong>Overlay Warning</strong>: When the entire content is about food (like a recipe), overlay hides it completely. Original preserved behind the warning (high semantic fidelity when revealed)."
    }
];