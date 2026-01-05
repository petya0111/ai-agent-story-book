"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/NavBar";
import { fetchBookMetadata, generateHeroRewrite, fetchPages } from "../../../lib/api";

type HeroSpec = {
  name: string;
  age: number;
  personality: string[];
  role: string;
};

type StoryVariation = {
  id: string;
  title: string;
  hero: HeroSpec;
  description: string;
  theme: string;
  createdAt: string;
};

export default function HeroicTalesPage() {
  const [variations, setVariations] = useState<StoryVariation[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Creator form state
  const [heroName, setHeroName] = useState("");
  const [heroAge, setHeroAge] = useState(25);
  const [selectedPersonality, setSelectedPersonality] = useState<string[]>([]);
  const [heroRole, setHeroRole] = useState("");
  const [customConstraints, setCustomConstraints] = useState("");

  const personalityTraits = [
    "Brave", "Wise", "Compassionate", "Cunning", "Honorable", "Rebellious",
    "Patient", "Fierce", "Mysterious", "Charismatic", "Humble", "Ambitious",
    "Loyal", "Independent", "Scholarly", "Intuitive"
  ];

  const heroRoles = [
    "Warrior", "Mage", "Scholar", "Thief", "Noble", "Merchant",
    "Healer", "Assassin", "Bard", "Monk", "Ranger", "Paladin"
  ];

  const predefinedVariations: StoryVariation[] = [
    {
      id: "original",
      title: "The Last Descendant",
      hero: { name: "Hale Mallory", age: 23, personality: ["Noble", "Thoughtful", "Determined"], role: "Royal Heir" },
      description: "The original tale of Hale Mallory, last descendant of Regalis, as he discovers the true meaning of leadership.",
      theme: "Classic Fantasy",
      createdAt: new Date().toISOString()
    },
    {
      id: "warrior",
      title: "The Warrior's Path",
      hero: { name: "Thane Ironheart", age: 28, personality: ["Fierce", "Honorable", "Loyal"], role: "Warrior" },
      description: "A battle-hardened warrior must learn that true strength comes from within, not from the sword.",
      theme: "Epic Adventure",
      createdAt: new Date().toISOString()
    },
    {
      id: "mage",
      title: "The Arcane Journey",
      hero: { name: "Lyra Starweaver", age: 19, personality: ["Wise", "Curious", "Mysterious"], role: "Mage" },
      description: "A young mage discovers that the greatest magic is not in spells, but in understanding the hearts of others.",
      theme: "Mystical Fantasy",
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Load saved variations from localStorage
    try {
      const saved = localStorage.getItem("heroic_tales_variations");
      if (saved) {
        const parsed = JSON.parse(saved);
        setVariations([...predefinedVariations, ...parsed]);
      } else {
        setVariations(predefinedVariations);
      }
    } catch (e) {
      setVariations(predefinedVariations);
    }
  }, []);

  // Auto-derived suggestions from Hale PDF (small preview)
  const [derivedSuggestions, setDerivedSuggestions] = useState<string[]>([]);
  useEffect(() => {
    // fetch first few pages from the Hale book (bookId 2) and derive questions
    async function loadPreview() {
      try {
        const pages = await fetchPages(2, 1, 3);
        const texts = (pages || []).map((p: any) => p.text || "");
        const qs = (await import("../../../lib/derive")).deriveQuestionsFromTexts(texts, 6);
        setDerivedSuggestions(qs);
      } catch (e) {
        // ignore silently
      }
    }
    loadPreview();
  }, []);

  function togglePersonality(trait: string) {
    setSelectedPersonality(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait].slice(0, 4) // Max 4 traits
    );
  }

  async function createVariation() {
    if (!heroName.trim() || selectedPersonality.length === 0 || !heroRole) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const newVariation: StoryVariation = {
        id: `custom-${Date.now()}`,
        title: `The Tale of ${heroName}`,
        hero: {
          name: heroName,
          age: heroAge,
          personality: selectedPersonality,
          role: heroRole
        },
        description: `A customized adventure featuring ${heroName}, the ${heroRole}, whose ${selectedPersonality.join(', ').toLowerCase()} nature shapes their destiny.`,
        theme: "Custom Adventure",
        createdAt: new Date().toISOString()
      };

      const updatedVariations = [...variations, newVariation];
      setVariations(updatedVariations);
      
      // Save to localStorage
      const customVariations = updatedVariations.filter(v => v.id.startsWith('custom-'));
      localStorage.setItem("heroic_tales_variations", JSON.stringify(customVariations));
      
      // Reset form
      setHeroName("");
      setHeroAge(25);
      setSelectedPersonality([]);
      setHeroRole("");
      setCustomConstraints("");
      setShowCreator(false);
      
    } catch (error) {
      console.error("Failed to create variation:", error);
      alert("Failed to create variation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function deleteVariation(id: string) {
    if (!id.startsWith('custom-')) return; // Can't delete predefined
    
    const updatedVariations = variations.filter(v => v.id !== id);
    setVariations(updatedVariations);
    
    const customVariations = updatedVariations.filter(v => v.id.startsWith('custom-'));
    localStorage.setItem("heroic_tales_variations", JSON.stringify(customVariations));
  }

  function experienceTale(variation: StoryVariation) {
    // Navigate to Oracle page with hero context
    const heroContext = {
      heroName: variation.hero.name,
      heroAge: variation.hero.age,
      heroRole: variation.hero.role,
      heroPersonality: variation.hero.personality.join(', '),
      taleTitle: variation.title,
      taleDescription: variation.description
    };
    
    // Encode the hero context as URL parameters
    const params = new URLSearchParams({
      bookId: '2', // Hale story book ID
      title: `${variation.title} - Featuring ${variation.hero.name}`,
      heroContext: JSON.stringify(heroContext)
    });
    
    // Navigate to Oracle with hero context
    router.push(`/oracle?${params.toString()}`);
  }

  function getThemeColor(theme: string) {
    const colors: Record<string, string> = {
      "Classic Fantasy": "#d4af37",
      "Epic Adventure": "#c2410c",
      "Mystical Fantasy": "#8b5cf6",
      "Custom Adventure": "#10b981"
    };
    return colors[theme] || "#6b7280";
  }

  function getRoleIcon(role: string) {
    const icons: Record<string, string> = {
      "Warrior": "⚔️",
      "Mage": "🔮",
      "Scholar": "📚",
      "Thief": "🗡️",
      "Noble": "👑",
      "Merchant": "💰",
      "Healer": "🌿",
      "Assassin": "🗡️",
      "Bard": "🎵",
      "Monk": "🧘",
      "Ranger": "🏹",
      "Paladin": "🛡️"
    };
    return icons[role] || "⚔️";
  }

  return (
    <>
      <NavBar />
      <div className="heroic-tales-container">
        <div className="magical-background">
          <div className="floating-orbs">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className={`orb orb-${i + 1}`} />
            ))}
          </div>
          <div className="mystical-grid">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="grid-dot" style={{
                '--delay': `${Math.random() * 4}s`,
                '--duration': `${3 + Math.random() * 2}s`
              } as React.CSSProperties} />
            ))}
          </div>
        </div>

        <div className="tales-hero-section">
          <div className="hero-visual">
            <img src="/assets/base/base_sillhouette.png" alt="Hero visual" className="hero-visual-img" />
          </div>
          <div className="hero-content">
            <div className="hero-icon-container">
              <div className="hero-icon">⚔️</div>
              <div className="icon-glow"></div>
            </div>
            <h1 className="hero-title">
              <span className="title-word">Heroic</span>
              <span className="title-word">Tales</span>
            </h1>
            <p className="hero-subtitle">
              Forge legendary heroes and witness their destinies unfold. Use the Hale chronicle as story
              source material to guide the Oracle's responses and generate variations.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{variations.length}</span>
                <span className="stat-label">Legends</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{variations.filter(v => v.id.startsWith('custom-')).length}</span>
                <span className="stat-label">Custom Heroes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">∞</span>
                <span className="stat-label">Possibilities</span>
              </div>
            </div>
          </div>
          
          <div className="hero-action">
            <button 
              className={`forge-new-hero ${showCreator ? 'active' : ''}`}
              onClick={() => setShowCreator(!showCreator)}
            >
              <span className="btn-icon">✨</span>
              <span className="btn-text">{showCreator ? 'Hide Forge' : 'Forge New Hero'}</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>

        {showCreator && (
          <div className="hero-forge-modal">
            <div className="forge-container">
              <div className="forge-header">
                <div className="forge-title">
                  <span className="forge-icon">🛡️</span>
                  <h2>Hero Creation Forge</h2>
                </div>
                <button 
                  className="close-forge"
                  onClick={() => setShowCreator(false)}
                >
                  <span>✕</span>
                </button>
              </div>
              
              <div className="forge-body">
                <div className="forge-steps">
                  <div className="step-indicator">
                    <div className="step active">1</div>
                    <div className="step-line"></div>
                    <div className="step">2</div>
                    <div className="step-line"></div>
                    <div className="step">3</div>
                  </div>
                </div>

                <div className="forge-content">
                  <div className="forge-section identity">
                    <div className="section-header">
                      <h3>⚡ Identity</h3>
                      <p>Define your hero's essence</p>
                    </div>
                    <div className="input-group">
                      <div className="floating-input">
                        <input
                          type="text"
                          value={heroName}
                          onChange={(e) => setHeroName(e.target.value)}
                          placeholder=" "
                          id="heroName"
                        />
                        <label htmlFor="heroName">Hero Name</label>
                        <div className="input-shine"></div>
                      </div>
                      <div className="floating-input">
                        <input
                          type="number"
                          value={heroAge}
                          onChange={(e) => setHeroAge(parseInt(e.target.value) || 25)}
                          min="16"
                          max="80"
                          placeholder=" "
                          id="heroAge"
                        />
                        <label htmlFor="heroAge">Age</label>
                        <div className="input-shine"></div>
                      </div>
                    </div>
                  </div>

                  <div className="forge-section role">
                    <div className="section-header">
                      <h3>🎭 Calling</h3>
                      <p>Choose your hero's path</p>
                    </div>
                    <div className="role-grid">
                      {heroRoles.map(role => (
                        <div 
                          key={role} 
                          className={`role-card ${heroRole === role ? 'selected' : ''}`}
                          onClick={() => setHeroRole(role)}
                        >
                          <div className="role-icon">{getRoleIcon(role)}</div>
                          <span className="role-name">{role}</span>
                          <div className="role-glow"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="forge-section personality">
                    <div className="section-header">
                      <h3>🌟 Soul Traits</h3>
                      <p>Select up to 4 defining characteristics</p>
                      <div className="trait-counter">
                        {selectedPersonality.length}/4
                      </div>
                    </div>
                    <div className="traits-grid">
                      {personalityTraits.map(trait => (
                        <button
                          key={trait}
                          className={`trait-orb ${selectedPersonality.includes(trait) ? 'selected' : ''}`}
                          onClick={() => togglePersonality(trait)}
                          disabled={!selectedPersonality.includes(trait) && selectedPersonality.length >= 4}
                        >
                          <span className="trait-text">{trait}</span>
                          <div className="orb-glow"></div>
                          <div className="trait-particles">
                            {Array.from({length: 3}).map((_, i) => (
                              <div key={i} className={`particle particle-${i}`} />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="forge-section constraints">
                    <div className="section-header">
                      <h3>📜 Special Instructions</h3>
                      <p>Any unique aspects of your hero's tale</p>
                    </div>
                    <div className="floating-textarea">
                      <textarea
                        value={customConstraints}
                        onChange={(e) => setCustomConstraints(e.target.value)}
                        placeholder=" "
                        id="constraints"
                        rows={4}
                      />
                      <label htmlFor="constraints">Special Constraints</label>
                      <div className="textarea-shine"></div>
                    </div>
                  </div>

                  <div className="forge-actions">
                    <button 
                      className="forge-hero-btn"
                      onClick={createVariation}
                      disabled={loading || !heroName.trim() || selectedPersonality.length === 0 || !heroRole}
                    >
                      <span className="btn-icon">🔥</span>
                      <span className="btn-text">
                        {loading ? "Forging Legend..." : "Forge Hero"}
                      </span>
                      <div className="btn-energy"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="legends-section">
          <div className="section-title">
            <h2>Gallery of Legends</h2>
            <p>Choose a hero and embark on their epic journey</p>
          </div>

          <div className="legends-gallery">
            {variations.map((variation) => (
              <div key={variation.id} className="legend-card">
                <div className="card-background">
                  <div className="card-gradient" style={{ 
                    background: `linear-gradient(135deg, ${getThemeColor(variation.theme)}20, transparent)` 
                  }} />
                  <div className="floating-particles">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`card-particle particle-${i + 1}`} />
                    ))}
                  </div>
                </div>

                <div className="card-header">
                  <div className="theme-badge" style={{ 
                    backgroundColor: getThemeColor(variation.theme),
                    boxShadow: `0 0 20px ${getThemeColor(variation.theme)}40`
                  }}>
                    {variation.theme}
                  </div>
                  <h3 className="legend-title">{variation.title}</h3>
                </div>

                <div className="hero-showcase">
                  <div className="hero-avatar">
                    <div className="avatar-circle" style={{
                      background: `linear-gradient(135deg, ${getThemeColor(variation.theme)}, ${getThemeColor(variation.theme)}80)`
                    }}>
                      <span className="avatar-icon">{getRoleIcon(variation.hero.role)}</span>
                      <div className="avatar-glow" style={{ 
                        boxShadow: `0 0 40px ${getThemeColor(variation.theme)}60` 
                      }} />
                    </div>
                    <div className="hero-name">{variation.hero.name}</div>
                  </div>
                  
                  <div className="hero-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-icon">🎂</span>
                        <span className="detail-value">{variation.hero.age} years</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">⚔️</span>
                        <span className="detail-value">{variation.hero.role}</span>
                      </div>
                    </div>
                    
                    <div className="traits-showcase">
                      {variation.hero.personality.map(trait => (
                        <span key={trait} className="trait-gem">
                          {trait}
                          <div className="gem-shine" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="legend-description">
                  {variation.description}
                </div>

                <div className="card-footer">
                  <button 
                    className="experience-btn"
                    onClick={() => experienceTale(variation)}
                  >
                    <span className="btn-icon">🎭</span>
                    <span className="btn-text">Experience Tale</span>
                    <div className="btn-ripple" />
                  </button>
                  
                  {variation.id.startsWith('custom-') && (
                    <button 
                      className="delete-btn"
                      onClick={() => deleteVariation(variation.id)}
                    >
                      <span className="btn-icon">🗑️</span>
                    </button>
                  )}
                </div>
                
                <div className="card-timestamp">
                  Forged {new Date(variation.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {variations.filter(v => v.id.startsWith('custom-')).length === 0 && !showCreator && (
          <div className="empty-legends-state">
            <div className="empty-animation">
              <div className="floating-castle">🏰</div>
              <div className="magical-sparkles">
                {Array.from({length: 12}).map((_, i) => (
                  <div key={i} className={`sparkle sparkle-${i + 1}`}>✨</div>
                ))}
              </div>
            </div>
            <h3>Your Legendary Gallery Awaits</h3>
            <p>
              The forge stands ready to birth new legends. Create heroes whose tales will echo 
              through eternity, each one a unique thread in the grand tapestry of destiny.
            </p>
            <button 
              className="begin-legend-btn"
              onClick={() => setShowCreator(true)}
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-text">Begin Your Legend</span>
              <div className="btn-magic-trail" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}