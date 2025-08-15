import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pedsData from "./data/peds.json";
import fetchNui from "./hooks/fetchNui";
import useNuiEvent from "./hooks/useNuiEvent";

// Types thème
interface ThemeDefinition {
  name: string;
  accent: string;
  accentSoft: string;
  panelBackground: string;
  panelBorder: string;
  backgroundImage: string;
  backgroundOverlay: string;
  backgroundBlur: string;
  itemBg: string;
  itemBgHover: string;
  itemBgActive: string;
  favoriteBg: string;
  favoriteInactiveBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  scrollbarThumb: string;
  scrollbarTrack: string;
  svgAccent?: string;
  radius: string;
  fontFamily: string;
}
interface ThemeServerResponse {
  current: string;
  themes: Record<string, ThemeDefinition>;
}

// Composants d'icônes SVG
const StarIcon = ({
  filled = false,
  className = "",
}: {
  filled?: boolean;
  className?: string;
}) =>
  filled ? (
    <svg
      className={className}
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.59215 3.50773L7.40706 0.954351C7.04875 0.182341 5.95124 0.182341 5.59294 0.954352L4.40785 3.50773C4.26535 3.81476 3.9772 4.02886 3.64211 4.0767L0.957183 4.46002C0.145632 4.57588 -0.1894 5.56536 0.384819 6.15044L2.40748 8.21134C2.63306 8.44118 2.73414 8.7656 2.67904 9.0829L2.18373 11.935C2.0398 12.7638 2.92109 13.3891 3.65583 12.9796L6.01315 11.6657C6.3158 11.497 6.6842 11.497 6.98685 11.6657L9.34925 12.9824C10.0831 13.3915 10.9637 12.7681 10.8217 11.94L10.3206 9.01709C10.2658 8.69721 10.3696 8.3706 10.5991 8.14108L12.586 6.15377C13.1686 5.57103 12.8359 4.57324 12.0201 4.45678L9.35789 4.0767C9.0228 4.02886 8.73465 3.81476 8.59215 3.50773Z"
        fill="var(--svg-accent)"
      />
    </svg>
  ) : (
    <svg
      className={className}
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.59215 3.50773L7.40706 0.954351C7.04875 0.182341 5.95124 0.182341 5.59294 0.954352L4.40785 3.50773C4.26535 3.81476 3.9772 4.02886 3.64211 4.0767L0.957183 4.46002C0.145632 4.57588 -0.1894 5.56536 0.384819 6.15044L2.40748 8.21134C2.63306 8.44118 2.73414 8.7656 2.67904 9.0829L2.18373 11.935C2.0398 12.7638 2.92109 13.3891 3.65583 12.9796L6.01315 11.6657C6.3158 11.497 6.6842 11.497 6.98685 11.6657L9.34925 12.9824C10.0831 13.3915 10.9637 12.7681 10.8217 11.94L10.3206 9.01709C10.2658 8.69721 10.3696 8.3706 10.5991 8.14108L12.586 6.15377C13.1686 5.57103 12.8359 4.57324 12.0201 4.45678L9.35789 4.0767C9.0228 4.02886 8.73465 3.81476 8.59215 3.50773Z"
        fill="#070707"
      />
    </svg>
  );

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const categories = [
  "All",
  "Civilian",
  "Characters",
  "Animals",
  "Police",
  "Gang",
];

interface PedData {
  model: string;
  image: string;
  category?: string;
}

// Fonction pour convertir le nom du modèle en nom lisible
const formatPedName = (model: string): string => {
  return model
    .replace(/^a_c_/g, "") // Supprimer préfixe animals
    .replace(/^cs_/g, "") // Supprimer préfixe characters
    .replace(/^csb_/g, "") // Supprimer préfixe characters
    .replace(/^g_f_/g, "") // Supprimer préfixe gang female
    .replace(/^g_m_/g, "") // Supprimer préfixe gang male
    .replace(/^g_/g, "") // Supprimer préfixe gang
    .replace(/^ig_/g, "") // Supprimer préfixe ig
    .replace(/^mp_/g, "") // Supprimer préfixe mp
    .replace(/^s_/g, "") // Supprimer préfixe s
    .replace(/^u_/g, "") // Supprimer préfixe u
    .replace(/_/g, " ") // Remplacer underscores par espaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Mettre en majuscule
};

// Fonction pour déterminer la catégorie d'un ped
const getPedCategory = (model: string): string => {
  if (model.startsWith("a_c_")) return "Animals";
  if (
    model.startsWith("cs_") ||
    model.startsWith("csb_") ||
    model.startsWith("ig_")
  )
    return "Characters";
  if (model.startsWith("g_")) return "Gang";
  if (
    model.includes("cop") ||
    model.includes("police") ||
    model.includes("sheriff") ||
    model.includes("swat")
  )
    return "Police";
  return "Civilian";
};

// Enrichir les données avec les catégories et corriger les chemins d'images
const enrichedPeds: PedData[] = pedsData
  .map((ped) => ({
    ...ped,
    image: ped.image.replace("./ped_images/", "./assets/peds/"),
    category: getPedCategory(ped.model),
  }))
  // Supprimer les doublons basés sur le modèle
  .filter(
    (ped, index, self) => index === self.findIndex((p) => p.model === ped.model)
  );

const PedMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Maintenant false par défaut
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("pedMenuFavorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPed, setSelectedPed] = useState<string | null>(() => {
    const saved = localStorage.getItem("pedMenuSelected");
    return saved || null;
  });
  const [themeResp, setThemeResp] = useState<ThemeServerResponse | null>(null);
  const [currentThemeKey, setCurrentThemeKey] = useState<string>("");
  const currentTheme: ThemeDefinition | undefined = (currentThemeKey && themeResp?.themes[currentThemeKey]) || undefined;

  const gridRef = useRef<HTMLDivElement>(null);

  useNuiEvent("show_menu", () => {
    setIsVisible(true);
  });

  // Fonction pour remettre le scroll en haut
  const scrollToTop = () => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  };

  // Reset scroll quand on change de catégorie ou de mode favoris
  useEffect(() => {
    scrollToTop();
  }, [activeTab, showFavorites]);

  // Gestion de la touche Échap pour fermer le menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  // Chargement du fichier de thèmes au montage
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetchNui<ThemeServerResponse>("get_theme", {ped:selectedPed});
        if (resp && resp.themes) {
          setThemeResp(resp);
          setCurrentThemeKey(resp.current);
        }
      } catch (e) {
        console.warn("Impossible de charger le theme (get_theme)", e);
      }
    })();
  }, []);

  // Application des variables CSS du thème
  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;
    root.classList.add("theme-transition");
    const t = currentTheme;
    if (t) {
      const map: Record<string, string> = {
        "--accent": t.accent,
        "--accent-soft": t.accentSoft,
          "--svg-accent": t.svgAccent || t.accent,
        "--panel-bg": t.panelBackground,
        "--panel-border": t.panelBorder,
        "--bg-image": t.backgroundImage,
        "--bg-overlay": t.backgroundOverlay,
        "--bg-blur": t.backgroundBlur,
        "--item-bg": t.itemBg,
        "--item-bg-hover": t.itemBgHover,
        "--item-bg-active": t.itemBgActive,
        "--favorite-bg": t.favoriteBg,
        "--favorite-inactive-bg": t.favoriteInactiveBg,
        "--text-primary": t.textPrimary,
        "--text-secondary": t.textSecondary,
        "--text-muted": t.textMuted,
        "--scrollbar-thumb": t.scrollbarThumb,
        "--scrollbar-track": t.scrollbarTrack,
        "--radius": t.radius,
        "--font-family": t.fontFamily,
      };
      Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
    }
    const timeout = setTimeout(
      () => root.classList.remove("theme-transition"),
      300
    );
    return () => clearTimeout(timeout);
  }, [currentTheme]);

  const closeMenu = () => {
    setIsVisible(false);
    fetchNui("close_menu");
  };

  // Sauvegarder les favoris dans le localStorage
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem("pedMenuFavorites", JSON.stringify(newFavorites));
  };

  // Ajouter/retirer un favori
  const toggleFavorite = (pedModel: string) => {
    const newFavorites = favorites.includes(pedModel)
      ? favorites.filter((fav: string) => fav !== pedModel)
      : [...favorites, pedModel];
    saveFavorites(newFavorites);
  };

  // Sélectionner un ped
  const selectPed = (pedModel: string) => {
    setSelectedPed(pedModel);
    localStorage.setItem("pedMenuSelected", pedModel);
    fetchNui("select_ped", { model: pedModel });
  };

  // Fonction pour obtenir un ped aléatoire
  const getRandomPed = () => {
    const availablePeds = filteredPeds.length > 0 ? filteredPeds : enrichedPeds;
    const randomIndex = Math.floor(Math.random() * availablePeds.length);
    const randomPed = availablePeds[randomIndex];
    selectPed(randomPed.model);
  };

  // Réinitialiser la sélection
  const resetToDefault = () => {
    setSelectedPed(null);
    localStorage.removeItem("pedMenuSelected");
    fetchNui("reset_ped");
  };

  const getFilteredPeds = (): PedData[] => {
    let filtered = enrichedPeds;

    // Filtrer par favoris si activé
    if (showFavorites) {
      filtered = filtered.filter((ped) => favorites.includes(ped.model));
    } else if (activeTab !== "All") {
      // Filtrer par catégorie normale
      filtered = filtered.filter((ped) => ped.category === activeTab);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (ped) =>
          ped.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatPedName(ped.model)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPeds = getFilteredPeds();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          <motion.div
            className="fixed top-16 right-16 w-[450px] h-[700px] text-white p-5 z-50 flex flex-col"
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--panel-border)",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-family)",
            }}
            initial={{ opacity: 0, transform: "translateX(50px) scale(0.95)" }}
            animate={{ opacity: 1, transform: "translateX(0) scale(1)" }}
            exit={{ opacity: 0, transform: "translateX(50px) scale(0.95)" }}
            key="menu"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ped Menu
                </h2>
                {selectedPed && (
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Sélectionné: {formatPedName(selectedPed)}
                  </p>
                )}
                {currentTheme && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Thème: {currentTheme.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {filteredPeds.length} peds{" "}
                  {showFavorites &&
                    favorites.length > 0 &&
                    `(${favorites.length} favoris)`}
                </span>
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="relative p-2 rounded-md transition-all duration-200 group cursor-pointer"
                  style={{
                    background: showFavorites ? "var(--item-bg-hover)" : "var(--item-bg)",
                    color: showFavorites ? "var(--accent)" : "var(--text-secondary)",
                    boxShadow: showFavorites ? "0 0 0 2px var(--accent-soft)" : undefined,
                  }}
                  title={
                    showFavorites ? "Voir tous les peds" : "Voir les favoris"
                  }
                >
                  {!showFavorites && (
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                  <div>
                    <StarIcon filled={showFavorites} className="w-5 h-5" />
                  </div>
                  {favorites.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ background: "var(--accent)" }}
                    >
                      {favorites.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={closeMenu}
                  className="relative p-2 rounded-md transition-all duration-200 group cursor-pointer"
                  style={{ background: "var(--item-bg)", color: "var(--text-secondary)" }}
                  title="Fermer le menu"
                >
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 opacity-0 group-hover:opacity-100"
                    style={{ background: "var(--accent)" }}
                  />
                  <div>
                    <CloseIcon className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search peds..."
                  className="w-full px-4 py-3 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    background: "var(--item-bg)",
                    color: "var(--text-primary)",
                    border: "1px solid transparent",
                    boxShadow: "0 0 0 0 var(--accent-soft)",
                  }}
                  value={searchTerm}
                  onFocus={() => {
                    fetchNui("handle_input_focus", { state: true });
                  }}
                  onBlur={() => {
                    fetchNui("handle_input_focus", { state: false });
                  }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                    title="Effacer la recherche"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between mb-4 relative">
              <div className="absolute inset-0 rounded-lg" style={{ background: "var(--item-bg)" }} />
              {!showFavorites && (
                <motion.div
                  className="absolute rounded-md h-full"
                  style={{
                    width: `${100 / categories.length}%`,
                    left: `${(categories.indexOf(activeTab) / categories.length) * 100}%`,
                    background: "var(--accent-soft)",
                    boxShadow: "0 0 0 1px var(--accent-soft)",
                  }}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
                />
              )}
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setShowFavorites(false);
                  }}
                  className="relative flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 z-10 group cursor-pointer"
                  style={{
                    background: activeTab === cat && !showFavorites ? "var(--item-bg-hover)" : "transparent",
                    color: activeTab === cat && !showFavorites ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {(activeTab !== cat || showFavorites) && (
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 opacity-0 group-hover:opacity-100"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                  <div>{cat}</div>
                </button>
              ))}
            </div>
            <div className="w-full h-0.5 mb-4 opacity-50" style={{ background: "var(--accent)" }} />
            <div ref={gridRef} className="grid grid-cols-3 gap-3 content-start flex-1 overflow-y-auto mb-4 pr-2 scrollbar-red">
              <motion.div
                key={`${activeTab}-${showFavorites}`}
                className="contents"
                initial={{ opacity: 0, transform: "translateX(20px)" }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transform: "translateX(-20px)" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {filteredPeds.map((ped) => (
                  <div key={ped.model} className="relative">
                    <button
                      className="relative w-full h-32 p-3 rounded-md transition-all duration-300 group cursor-pointer border"
                      style={{
                        background: selectedPed === ped.model ? "var(--item-bg-hover)" : "var(--item-bg)",
                        color: selectedPed === ped.model ? "var(--accent)" : "var(--text-primary)",
                        borderColor: "transparent",
                      }}
                      onClick={() => selectPed(ped.model)}
                    >
                      {selectedPed === ped.model && (
                        <div className="absolute inset-0 pointer-events-none">
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <motion.rect
                              x="1.5"
                              y="1.5"
                              width="97"
                              height="97"
                              rx="3"
                              ry="3"
                              stroke="var(--accent)"
                              strokeWidth="1.5"
                              fill="none"
                              initial={{ strokeDashoffset: 388 }}
                              animate={{ strokeDashoffset: 0 }}
                              transition={{ duration: 1.2, ease: "easeInOut" }}
                              style={{ strokeDasharray: "388", transformOrigin: "50% 100%" }}
                            />
                          </svg>
                        </div>
                      )}
                      {selectedPed !== ped.model && (
                        <div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 opacity-0 group-hover:opacity-100"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      <div className="flex flex-col items-center justify-between h-full">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden transition-all flex items-center justify-center relative mt-1"
                          style={{ background: "var(--item-bg-hover)" }}
                        >
                          <img
                            src={ped.image}
                            alt={formatPedName(ped.model)}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/80x100/374151/ffffff?text=${ped.model.slice(
                                0,
                                3
                              )}`;
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium text-center leading-tight px-1 mb-1 overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            maxHeight: "2.4em",
                            color: "var(--text-primary)",
                          }}
                        >
                          {formatPedName(ped.model)}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ped.model);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10 cursor-pointer"
                      style={{
                        background: favorites.includes(ped.model) ? "var(--favorite-bg)" : "var(--favorite-inactive-bg)",
                        boxShadow: favorites.includes(ped.model) ? "0 0 0 2px var(--accent-soft)" : undefined,
                      }}
                      title={
                        favorites.includes(ped.model) ? "Retirer des favoris" : "Ajouter aux favoris"
                      }
                    >
                      <StarIcon filled={favorites.includes(ped.model)} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            </div>
            {filteredPeds.length === 0 && (
              <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                {showFavorites ? (
                  <>
                    <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>Aucun favori sauvegardé</p>
                    <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                      Cliquez sur{" "}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mx-1" style={{ background: "var(--favorite-inactive-bg)" }}>
                        <StarIcon className="w-3 h-3" />
                      </span>{" "}
                      pour ajouter des peds en favoris
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>Aucun ped trouvé</p>
                    <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Essayez un autre terme de recherche</p>
                  </>
                )}
              </div>
            )}
            <div className="flex justify-between gap-3">
              <button
                onClick={getRandomPed}
                className="relative flex-1 text-sm px-4 py-2 rounded font-medium group cursor-pointer border"
                style={{ background: "var(--item-bg)", color: "var(--text-primary)", borderColor: "transparent" }}
              >
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 opacity-0 group-hover:opacity-100"
                  style={{ background: "var(--accent)" }}
                />
                <div>Random Ped</div>
              </button>
              <button
                onClick={resetToDefault}
                className="relative flex-1 text-sm px-4 py-2 rounded font-medium group cursor-pointer border"
                style={{ background: "var(--item-bg)", color: "var(--text-primary)", borderColor: "transparent" }}
              >
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 opacity-0 group-hover:opacity-100"
                  style={{ background: "var(--accent)" }}
                />
                <div>Reset Default</div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PedMenu;
