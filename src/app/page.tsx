"use client";

import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    Search,
    Sun,
    Moon,
    Type,
    Menu,
    X,
    Home,
    Newspaper,
    TrendingUp,
    Globe2,
    ChevronRight,
    Heart,
    Share2,
    Volume2,
    VolumeX,
    Bookmark,
    Clock,
    Eye,
    Zap,
    Filter,
    RefreshCw,
    Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AccessibleNewsApp = () => {
    const [articles, setArticles] = useState([]);
    const [allArticles, setAllArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState("medium");
    const [selectedCategory, setSelectedCategory] = useState("general");
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [announceMessage, setAnnounceMessage] = useState("");
    const [savedArticles, setSavedArticles] = useState([]);
    const [likedArticles, setLikedArticles] = useState([]);
    const [readingMode, setReadingMode] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [speechEnabled, setSpeechEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [sortBy, setSortBy] = useState("publishedAt");
    const [showFilters, setShowFilters] = useState(false);
    const [readArticles, setReadArticles] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    const mainContentRef = useRef(null);
    const searchInputRef = useRef(null);
    const closeBtnRef = useRef(null);
    const lastFocusedRef = useRef(null);
    const announceTimeoutRef = useRef(null);
    const modalRef = useRef(null);

    const speechSynthesisAvailable =
        typeof window !== "undefined" && !!window.speechSynthesis;

    // Mapeamento de cores fixo para evitar problemas do Tailwind
    const categoryColors = {
        general: {
            gradient: "from-blue-600 to-blue-700",
            bg: "bg-blue-600",
            text: "text-blue-600",
        },
        business: {
            gradient: "from-green-600 to-green-700",
            bg: "bg-green-600",
            text: "text-green-600",
        },
        technology: {
            gradient: "from-purple-600 to-purple-700",
            bg: "bg-purple-600",
            text: "text-purple-600",
        },
        health: {
            gradient: "from-red-600 to-red-700",
            bg: "bg-red-600",
            text: "text-red-600",
        },
    };

    const categories = [
        {
            id: "general",
            name: "Geral",
            icon: Home,
            color: "blue",
            description: "Notícias gerais dos EUA",
        },
        {
            id: "business",
            name: "Negócios",
            icon: TrendingUp,
            color: "green",
            description: "Economia e finanças",
        },
        {
            id: "technology",
            name: "Tecnologia",
            icon: Globe2,
            color: "purple",
            description: "Inovação e tech",
        },
        {
            id: "health",
            name: "Saúde",
            icon: Newspaper,
            color: "red",
            description: "Saúde e bem-estar",
        },
    ];

    const fontSizes = {
        small: {
            text: "text-sm",
            heading: "text-2xl",
            subheading: "text-lg",
            card: "text-xs",
        },
        medium: {
            text: "text-base",
            heading: "text-3xl",
            subheading: "text-xl",
            card: "text-sm",
        },
        large: {
            text: "text-lg",
            heading: "text-4xl",
            subheading: "text-2xl",
            card: "text-base",
        },
    };

    useEffect(() => {
        // Carregar preferências do localStorage
        try {
            const savedDarkMode = localStorage.getItem("darkMode") === "true";
            const savedFontSize = localStorage.getItem("fontSize") || "medium";
            const savedHighContrast =
                localStorage.getItem("highContrast") === "true";
            const savedReducedMotion =
                localStorage.getItem("reducedMotion") === "true";
            const savedArticlesData = JSON.parse(
                localStorage.getItem("savedArticles") || "[]",
            );
            const likedArticlesData = JSON.parse(
                localStorage.getItem("likedArticles") || "[]",
            );
            const readArticlesData = JSON.parse(
                localStorage.getItem("readArticles") || "[]",
            );

            setDarkMode(savedDarkMode);
            setFontSize(savedFontSize);
            setHighContrast(savedHighContrast);
            setReducedMotion(savedReducedMotion);
            setSavedArticles(savedArticlesData);
            setLikedArticles(likedArticlesData);
            setReadArticles(readArticlesData);
        } catch (error) {
            console.error("Erro ao carregar preferências:", error);
        }
    }, []);

    // Persistir preferências no localStorage
    useEffect(() => {
        try {
            localStorage.setItem("darkMode", darkMode.toString());
            localStorage.setItem("fontSize", fontSize);
            localStorage.setItem("highContrast", highContrast.toString());
            localStorage.setItem("reducedMotion", reducedMotion.toString());
            localStorage.setItem(
                "savedArticles",
                JSON.stringify(savedArticles),
            );
            localStorage.setItem(
                "likedArticles",
                JSON.stringify(likedArticles),
            );
            localStorage.setItem("readArticles", JSON.stringify(readArticles));
        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
        }
    }, [
        darkMode,
        fontSize,
        highContrast,
        reducedMotion,
        savedArticles,
        likedArticles,
        readArticles,
    ]);

    useEffect(() => {
        fetchNews();
    }, [selectedCategory]);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        setImageErrors({});

        try {
            const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

            if (!apiKey || apiKey === "your_api_key_here") {
                throw new Error("API key não configurada");
            }

            const url = `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${apiKey}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "ok") {
                const slice = data.articles
                    .slice(0, 12)
                    .filter((article) => article.title !== "[Removed]");
                setArticles(slice);
                setAllArticles(slice);
                announce(
                    `${slice.length} notícias carregadas na categoria ${selectedCategory}`,
                );
            } else {
                throw new Error(data.message || "Erro na resposta da API");
            }
        } catch (err) {
            console.error("Erro ao buscar notícias:", err);
            setError(
                "Erro ao carregar notícias. Usando exemplos de demonstração.",
            );
            announce("Erro ao carregar notícias. Mostrando exemplos.");

            const demoArticles = [
                {
                    title: "Avanços em Inteligência Artificial transformam indústria tecnológica",
                    description:
                        "Novas ferramentas de IA generativa estão revolucionando a forma como empresas trabalham e inovam. Este é um exemplo de notícia para demonstração da plataforma.",
                    url: "#",
                    urlToImage:
                        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
                    publishedAt: new Date().toISOString(),
                    source: { name: "Tech News" },
                    content:
                        "Este é um artigo de demonstração completo sobre os avanços recentes em inteligência artificial...",
                },
                {
                    title: "Mercado financeiro mostra recuperação após volatilidade",
                    description:
                        "Investidores demonstram otimismo renovado após semana de incertezas. Análise completa das tendências do mercado.",
                    url: "#",
                    urlToImage:
                        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
                    publishedAt: new Date(Date.now() - 86400000).toISOString(),
                    source: { name: "Business Today" },
                    content:
                        "Artigo detalhado sobre a recuperação do mercado financeiro...",
                },
                {
                    title: "Inovações em saúde digital melhoram acesso a tratamentos",
                    description:
                        "Telemedicina e aplicativos de saúde expandem atendimento para áreas remotas, democratizando o acesso à saúde de qualidade.",
                    url: "#",
                    urlToImage:
                        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
                    publishedAt: new Date(Date.now() - 172800000).toISOString(),
                    source: { name: "Health Watch" },
                    content:
                        "Explore como a tecnologia está transformando o setor de saúde...",
                },
            ];
            setArticles(demoArticles);
            setAllArticles(demoArticles);
        } finally {
            setLoading(false);
        }
    };

    const announce = useCallback((message) => {
        setAnnounceMessage(message);
        if (announceTimeoutRef.current) {
            clearTimeout(announceTimeoutRef.current);
        }
        announceTimeoutRef.current = setTimeout(
            () => setAnnounceMessage(""),
            2000,
        );
    }, []);

    const handleSearch = useCallback(
        (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (searchQuery.trim()) {
                const filtered = allArticles.filter(
                    (article) =>
                        (article.title || "")
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        (article.description || "")
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                );
                setArticles(filtered);
                announce(
                    `${filtered.length} resultados encontrados para: ${searchQuery}`,
                );
            } else {
                setArticles(allArticles);
                announce("Busca limpa. Lista completa restaurada.");
            }
        },
        [searchQuery, allArticles, announce],
    );

    const skipToMain = useCallback(
        (e) => {
            e.preventDefault();
            mainContentRef.current?.focus();
            announce("Navegando para o conteúdo principal");
        },
        [announce],
    );

    const toggleDarkMode = useCallback(() => {
        setDarkMode((prev) => {
            const next = !prev;
            announce(next ? "Modo escuro ativado" : "Modo claro ativado");
            return next;
        });
    }, [announce]);

    const toggleHighContrast = useCallback(() => {
        setHighContrast((prev) => {
            const next = !prev;
            announce(
                next ? "Alto contraste ativado" : "Alto contraste desativado",
            );
            return next;
        });
    }, [announce]);

    const toggleReducedMotion = useCallback(() => {
        setReducedMotion((prev) => {
            const next = !prev;
            announce(
                next ? "Animações reduzidas ativadas" : "Animações ativadas",
            );
            return next;
        });
    }, [announce]);

    const changeFontSize = useCallback(
        (size) => {
            setFontSize(size);
            announce(
                `Tamanho da fonte alterado para ${
                    size === "small"
                        ? "pequeno"
                        : size === "large"
                          ? "grande"
                          : "médio"
                }`,
            );
        },
        [announce],
    );

    const changeCategory = useCallback(
        (category) => {
            setSelectedCategory(category);
            setMobileMenuOpen(false);
            announce(
                `Categoria alterada para ${
                    categories.find((c) => c.id === category)?.name
                }`,
            );
        },
        [categories, announce],
    );

    const toggleSaveArticle = useCallback(
        (article) => {
            const isSaved = savedArticles.some((a) => a.url === article.url);
            if (isSaved) {
                setSavedArticles((prev) =>
                    prev.filter((a) => a.url !== article.url),
                );
                announce("Artigo removido dos salvos");
            } else {
                setSavedArticles((prev) => [...prev, article]);
                announce("Artigo salvo com sucesso");
            }
        },
        [savedArticles, announce],
    );

    const toggleLikeArticle = useCallback(
        (article) => {
            const isLiked = likedArticles.some((a) => a.url === article.url);
            if (isLiked) {
                setLikedArticles((prev) =>
                    prev.filter((a) => a.url !== article.url),
                );
                announce("Like removido");
            } else {
                setLikedArticles((prev) => [...prev, article]);
                announce("Artigo curtido");
            }
        },
        [likedArticles, announce],
    );

    const markAsRead = useCallback(
        (article) => {
            if (!readArticles.some((a) => a.url === article.url)) {
                setReadArticles((prev) => [...prev, article]);
            }
        },
        [readArticles],
    );

    const openReadingMode = useCallback(
        (article) => {
            lastFocusedRef.current = document.activeElement;
            setSelectedArticle(article);
            setReadingMode(true);
            markAsRead(article);
            announce("Modo de leitura ativado");

            // Auto-speech se speechEnabled estiver ativo
            if (speechEnabled) {
                const text = `${article.title}. ${article.description || article.content || ""}`;
                setTimeout(() => speakText(text), 300);
            }
        },
        [markAsRead, announce, speechEnabled],
    );

    const closeReadingMode = useCallback(() => {
        setReadingMode(false);
        setSelectedArticle(null);
        stopSpeech();
        lastFocusedRef.current?.focus?.();
        announce("Modo de leitura desativado");
    }, [announce]);

    const speakText = useCallback(
        (text) => {
            if (!speechSynthesisAvailable) {
                announce("Leitura em voz alta não disponível neste navegador");
                return;
            }

            // Cancelar qualquer fala atual
            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "pt-BR";
            utterance.rate = 0.95;
            utterance.pitch = 1;

            utterance.onstart = () => {
                setIsSpeaking(true);
                announce("Iniciando leitura em voz alta");
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                announce("Leitura concluída");
            };

            utterance.onerror = (event) => {
                console.error("Erro na síntese de fala:", event);
                setIsSpeaking(false);
                announce("Erro durante a leitura em voz alta");
            };

            window.speechSynthesis.speak(utterance);
        },
        [speechSynthesisAvailable, announce],
    );

    const stopSpeech = useCallback(() => {
        if (speechSynthesisAvailable) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        announce("Leitura interrompida");
    }, [speechSynthesisAvailable, announce]);

    const shareArticle = useCallback(
        async (article) => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: article.title,
                        text: article.description,
                        url: article.url,
                    });
                    announce("Artigo compartilhado com sucesso");
                } catch (err) {
                    if (err.name !== "AbortError") {
                        announce("Compartilhamento cancelado");
                    }
                }
            } else if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(article.url);
                    announce("Link copiado para a área de transferência");
                } catch (err) {
                    announce("Não foi possível copiar o link");
                }
            } else {
                announce("Compartilhamento não suportado neste dispositivo");
            }
        },
        [announce],
    );

    const sortArticles = useCallback(
        (articlesToSort) => {
            const sorted = [...articlesToSort];
            if (sortBy === "publishedAt") {
                sorted.sort(
                    (a, b) =>
                        new Date(b.publishedAt || 0) -
                        new Date(a.publishedAt || 0),
                );
            } else if (sortBy === "title") {
                sorted.sort((a, b) =>
                    (a.title || "").localeCompare(b.title || ""),
                );
            }
            return sorted;
        },
        [sortBy],
    );

    const getContrastColors = useCallback(() => {
        if (highContrast) {
            return {
                bg: darkMode ? "bg-black" : "bg-white",
                text: darkMode ? "text-white" : "text-black",
                card: darkMode
                    ? "bg-black border-2 border-white"
                    : "bg-white border-2 border-black",
                border: darkMode ? "border-white" : "border-black",
                hover: darkMode ? "hover:bg-gray-900" : "hover:bg-gray-100",
                button: darkMode
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800",
                fontSelectorBg: darkMode
                    ? "bg-black border-2 border-white"
                    : "bg-white border-2 border-black",
                fontSelectorButton: darkMode
                    ? "bg-black hover:bg-gray-800 text-white"
                    : "bg-white hover:bg-gray-100 text-black",
            };
        }

        return {
            bg: darkMode
                ? "bg-gradient-to-br from-gray-900 to-gray-950"
                : "bg-gradient-to-br from-gray-50 to-blue-50",
            text: darkMode ? "text-gray-100" : "text-gray-900",
            card: darkMode
                ? "bg-gray-800/90 backdrop-blur-sm border-gray-700"
                : "bg-white/90 backdrop-blur-sm border-gray-200",
            border: darkMode ? "border-gray-700" : "border-gray-200",
            hover: darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50",
            button: "bg-blue-600 text-white hover:bg-blue-700",
            fontSelectorBg: darkMode ? "bg-gray-800" : "bg-gray-100",
            fontSelectorButton: darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900",
        };
    }, [darkMode, highContrast]);

    const colors = useMemo(() => getContrastColors(), [getContrastColors]);
    const transitionClass = reducedMotion ? "" : "transition-all duration-300";

    const sortedArticles = useMemo(
        () => sortArticles(articles),
        [articles, sortArticles],
    );

    const handleImageError = useCallback((articleId) => {
        setImageErrors((prev) => ({ ...prev, [articleId]: true }));
    }, []);

    // Modal focus trap
    useEffect(() => {
        if (!readingMode) return;

        const modal = modalRef.current;
        if (!modal) return;

        // Focus no botão de fechar
        setTimeout(() => {
            closeBtnRef.current?.focus();
        }, 50);

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeReadingMode();
                return;
            }

            if (e.key === "Tab") {
                const focusableElements = modal.querySelectorAll(
                    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
                );

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (
                    !e.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [readingMode, closeReadingMode]);

    // Leitura automática ao abrir modal
    useEffect(() => {
        if (readingMode && selectedArticle && speechEnabled) {
            const text = `${selectedArticle.title}. ${selectedArticle.description || selectedArticle.content || ""}`;
            const timer = setTimeout(() => speakText(text), 500);
            return () => clearTimeout(timer);
        }
    }, [readingMode, selectedArticle, speechEnabled, speakText]);

    // Limpar síntese de fala ao desmontar
    useEffect(() => {
        return () => {
            if (speechSynthesisAvailable) {
                window.speechSynthesis.cancel();
            }
        };
    }, [speechSynthesisAvailable]);

    return (
        <div
            className={`min-h-screen ${colors.bg} ${colors.text} ${fontSizes[fontSize].text} ${transitionClass}`}
            role="application"
            aria-label="Aplicativo de notícias acessível"
        >
            {/* Skip Link */}
            <a
                href="#main-content"
                onClick={skipToMain}
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-8 focus:py-4 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 font-bold text-lg"
            >
                Pular para o conteúdo principal
            </a>

            {/* Live Region */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announceMessage}
            </div>

            {/* Header */}
            <header
                className={`sticky top-0 z-40 ${colors.card} border-b-2 ${colors.border} shadow-lg`}
                role="banner"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-12 h-12 ${colors.button} rounded-xl flex items-center justify-center shadow-lg`}
                            >
                                <Newspaper
                                    className="w-7 h-7"
                                    aria-hidden="true"
                                />
                            </div>
                            <h1
                                className={`${fontSizes[fontSize].heading} font-bold`}
                            >
                                Amplifica
                            </h1>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <div
                                role="group"
                                aria-label="Controles de tamanho de fonte"
                                className={`flex items-center space-x-2 p-2 rounded-xl ${colors.fontSelectorBg}`}
                            >
                                <Type className="w-5 h-5" aria-hidden="true" />
                                <button
                                    onClick={() => changeFontSize("small")}
                                    className={`px-4 py-2 rounded-lg font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "small"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : `${colors.fontSelectorButton}`
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-label="Fonte pequena"
                                    aria-pressed={fontSize === "small"}
                                >
                                    A
                                </button>
                                <button
                                    onClick={() => changeFontSize("medium")}
                                    className={`px-4 py-2 rounded-lg text-lg font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "medium"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : `${colors.fontSelectorButton}`
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-label="Fonte média"
                                    aria-pressed={fontSize === "medium"}
                                >
                                    A
                                </button>
                                <button
                                    onClick={() => changeFontSize("large")}
                                    className={`px-4 py-2 rounded-lg text-xl font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "large"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : `${colors.fontSelectorButton}`
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-label="Fonte grande"
                                    aria-pressed={fontSize === "large"}
                                >
                                    A
                                </button>
                            </div>

                            <button
                                onClick={toggleDarkMode}
                                className={`p-3 rounded-xl ${colors.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass} min-w-[44px] min-h-[44px] shadow-sm`}
                                aria-label={
                                    darkMode
                                        ? "Ativar modo claro"
                                        : "Ativar modo escuro"
                                }
                                aria-pressed={darkMode}
                            >
                                {darkMode ? (
                                    <Sun
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Moon
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>

                            <button
                                onClick={toggleHighContrast}
                                className={`p-3 rounded-xl min-w-[44px] min-h-[44px] shadow-sm ${
                                    highContrast
                                        ? "bg-blue-600 text-white"
                                        : colors.hover
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass}`}
                                aria-label={
                                    highContrast
                                        ? "Desativar alto contraste"
                                        : "Ativar alto contraste"
                                }
                                aria-pressed={highContrast}
                            >
                                <Eye className="w-6 h-6" aria-hidden="true" />
                            </button>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3 rounded-xl ${colors.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass} min-w-[44px] min-h-[44px] shadow-sm`}
                                aria-label="Mostrar filtros"
                                aria-expanded={showFilters}
                            >
                                <Settings
                                    className="w-6 h-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`lg:hidden p-3 rounded-xl ${colors.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px]`}
                            aria-label={
                                mobileMenuOpen ? "Fechar menu" : "Abrir menu"
                            }
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-7 h-7" aria-hidden="true" />
                            ) : (
                                <Menu className="w-7 h-7" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div
                            className={`lg:hidden py-6 border-t-2 ${colors.border} space-y-4`}
                            role="menu"
                        >
                            <div
                                role="group"
                                aria-label="Controles de tamanho de fonte para mobile"
                                className={`flex items-center justify-center space-x-2 p-3 rounded-xl ${colors.fontSelectorBg}`}
                            >
                                <Type className="w-5 h-5" aria-hidden="true" />
                                <button
                                    onClick={() => changeFontSize("small")}
                                    className={`px-5 py-3 rounded-lg font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "small"
                                            ? "bg-blue-600 text-white"
                                            : colors.fontSelectorButton
                                    }`}
                                    aria-label="Fonte pequena"
                                    role="menuitemradio"
                                    aria-checked={fontSize === "small"}
                                >
                                    A
                                </button>
                                <button
                                    onClick={() => changeFontSize("medium")}
                                    className={`px-5 py-3 rounded-lg text-lg font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "medium"
                                            ? "bg-blue-600 text-white"
                                            : colors.fontSelectorButton
                                    }`}
                                    aria-label="Fonte média"
                                    role="menuitemradio"
                                    aria-checked={fontSize === "medium"}
                                >
                                    A
                                </button>
                                <button
                                    onClick={() => changeFontSize("large")}
                                    className={`px-5 py-3 rounded-lg text-xl font-bold min-w-[44px] min-h-[44px] ${
                                        fontSize === "large"
                                            ? "bg-blue-600 text-white"
                                            : colors.fontSelectorButton
                                    }`}
                                    aria-label="Fonte grande"
                                    role="menuitemradio"
                                    aria-checked={fontSize === "large"}
                                >
                                    A
                                </button>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={toggleDarkMode}
                                    className={`flex items-center justify-center space-x-3 p-4 rounded-xl ${colors.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]`}
                                    aria-label={
                                        darkMode ? "Modo claro" : "Modo escuro"
                                    }
                                    role="menuitem"
                                >
                                    {darkMode ? (
                                        <Sun
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Moon
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span className="font-medium">
                                        {darkMode
                                            ? "Modo Claro"
                                            : "Modo Escuro"}
                                    </span>
                                </button>

                                <button
                                    onClick={toggleHighContrast}
                                    className={`flex items-center justify-center space-x-3 p-4 rounded-xl min-h-[44px] ${
                                        highContrast
                                            ? "bg-blue-600 text-white"
                                            : colors.hover
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-label="Alto contraste"
                                    role="menuitem"
                                >
                                    <Eye
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                    />
                                    <span className="font-medium">
                                        Alto Contraste
                                    </span>
                                </button>

                                <button
                                    onClick={toggleReducedMotion}
                                    className={`flex items-center justify-center space-x-3 p-4 rounded-xl min-h-[44px] ${
                                        reducedMotion
                                            ? "bg-blue-600 text-white"
                                            : colors.hover
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-label="Reduzir movimento"
                                    role="menuitem"
                                >
                                    <Zap
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                    />
                                    <span className="font-medium">
                                        Reduzir Animações
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div
                    className={`${colors.card} border-b-2 ${colors.border} py-6 shadow-lg`}
                    role="region"
                    aria-label="Filtros e ordenação"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Filter
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                />
                                <span className="font-bold">Ordenar por:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        announce(
                                            `Ordenação alterada para ${
                                                e.target.value === "publishedAt"
                                                    ? "data de publicação"
                                                    : "título"
                                            }`,
                                        );
                                    }}
                                    className={`px-4 py-2 rounded-xl ${colors.card} border-2 ${colors.border} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]`}
                                    aria-label="Selecionar ordenação"
                                >
                                    <option value="publishedAt">
                                        Data de Publicação
                                    </option>
                                    <option value="title">Título (A-Z)</option>
                                </select>
                            </div>

                            <button
                                onClick={toggleReducedMotion}
                                className={`flex items-center space-x-2 px-5 py-3 rounded-xl min-h-[44px] font-medium ${
                                    reducedMotion
                                        ? "bg-blue-600 text-white"
                                        : colors.hover
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                aria-label="Reduzir animações"
                                aria-pressed={reducedMotion}
                            >
                                <Zap className="w-5 h-5" aria-hidden="true" />
                                <span>Reduzir Animações</span>
                            </button>

                            <button
                                onClick={fetchNews}
                                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium shadow-md"
                                aria-label="Recarregar notícias"
                            >
                                <RefreshCw
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                />
                                <span>Atualizar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div
                className={`${colors.card} border-b-2 ${colors.border} py-8 shadow-sm`}
                role="search"
                aria-label="Buscar notícias"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSearch}>
                        <div className="relative max-w-3xl mx-auto">
                            <label htmlFor="search-input" className="sr-only">
                                Buscar notícias
                            </label>
                            <input
                                id="search-input"
                                ref={searchInputRef}
                                type="search"
                                placeholder="Buscar notícias..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full px-8 py-5 pr-16 rounded-2xl border-2 ${colors.border} ${colors.card} ${colors.text} focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 ${transitionClass} text-lg shadow-sm`}
                                aria-describedby="search-instructions"
                            />
                            <span id="search-instructions" className="sr-only">
                                Digite sua busca e pressione Enter para
                                pesquisar
                            </span>
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl min-w-[44px] min-h-[44px]"
                                aria-label="Executar busca"
                            >
                                <Search
                                    className="w-6 h-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Categories Navigation */}
            <nav
                className={`${colors.card} border-b-2 ${colors.border} py-6 shadow-sm`}
                aria-label="Categorias de notícias"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ul className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isActive = selectedCategory === category.id;
                            const colors = categoryColors[category.id];

                            return (
                                <li key={category.id}>
                                    <button
                                        onClick={() =>
                                            changeCategory(category.id)
                                        }
                                        className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold ${transitionClass} focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[44px] shadow-md ${
                                            isActive
                                                ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg scale-105`
                                                : `${colors.hover} ${colors.text}`
                                        }`}
                                        aria-label={`Categoria ${category.name}: ${category.description}`}
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                    >
                                        <Icon
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                        <span>{category.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <main
                id="main-content"
                ref={mainContentRef}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                tabIndex={-1}
                role="main"
            >
                {/* Statistics Bar */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                        className={`${colors.card} border-2 ${colors.border} rounded-2xl p-6 shadow-md`}
                    >
                        <div className="flex items-center space-x-3">
                            <Heart
                                className="w-8 h-8 text-red-500"
                                aria-hidden="true"
                            />
                            <div>
                                <p
                                    className={`text-2xl font-bold ${colors.text}`}
                                >
                                    {likedArticles.length}
                                </p>
                                <p className="text-sm opacity-75">
                                    Artigos Curtidos
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${colors.card} border-2 ${colors.border} rounded-2xl p-6 shadow-md`}
                    >
                        <div className="flex items-center space-x-3">
                            <Bookmark
                                className="w-8 h-8 text-blue-500"
                                aria-hidden="true"
                            />
                            <div>
                                <p
                                    className={`text-2xl font-bold ${colors.text}`}
                                >
                                    {savedArticles.length}
                                </p>
                                <p className="text-sm opacity-75">Salvos</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${colors.card} border-2 ${colors.border} rounded-2xl p-6 shadow-md`}
                    >
                        <div className="flex items-center space-x-3">
                            <Clock
                                className="w-8 h-8 text-green-500"
                                aria-hidden="true"
                            />
                            <div>
                                <p
                                    className={`text-2xl font-bold ${colors.text}`}
                                >
                                    {readArticles.length}
                                </p>
                                <p className="text-sm opacity-75">Lidos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav aria-label="Navegação estrutural" className="mb-8">
                    <ol
                        className="flex items-center space-x-2"
                        itemScope
                        itemType="https://schema.org/BreadcrumbList"
                    >
                        <li
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            <a
                                href="#"
                                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 font-medium"
                                itemProp="item"
                            >
                                <span itemProp="name">Início</span>
                            </a>
                            <meta itemProp="position" content="1" />
                        </li>
                        <li>
                            <ChevronRight
                                className="w-5 h-5 opacity-50"
                                aria-hidden="true"
                            />
                        </li>
                        <li
                            aria-current="page"
                            className="font-bold"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            <span itemProp="name">
                                {categories.find(
                                    (c) => c.id === selectedCategory,
                                )?.name || "Notícias"}
                            </span>
                            <meta itemProp="position" content="2" />
                        </li>
                    </ol>
                </nav>

                {loading && (
                    <div
                        className="text-center py-20"
                        role="status"
                        aria-live="polite"
                    >
                        <div
                            className={`inline-block ${
                                reducedMotion ? "" : "animate-spin"
                            } rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent`}
                            aria-hidden="true"
                        ></div>
                        <p className="mt-6 text-xl font-medium">
                            Carregando notícias...
                        </p>
                    </div>
                )}

                {error && (
                    <Alert className="mb-8 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <AlertDescription className="text-blue-800 dark:text-blue-200 text-lg">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {!loading && !error && (
                    <section aria-label="Lista de notícias">
                        <h2 className="sr-only">Notícias em destaque</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedArticles.map((article, index) => {
                                const isSaved = savedArticles.some(
                                    (a) => a.url === article.url,
                                );
                                const isLiked = likedArticles.some(
                                    (a) => a.url === article.url,
                                );
                                const isRead = readArticles.some(
                                    (a) => a.url === article.url,
                                );
                                const imageError = imageErrors[article.url];

                                return (
                                    <article
                                        key={`${article.url}-${index}`}
                                        className={`${
                                            colors.card
                                        } rounded-2xl shadow-lg overflow-hidden border-2 ${
                                            colors.border
                                        } ${
                                            !reducedMotion
                                                ? "hover:shadow-2xl hover:scale-105"
                                                : ""
                                        } ${transitionClass} focus-within:ring-4 focus-within:ring-blue-300`}
                                        itemScope
                                        itemType="https://schema.org/NewsArticle"
                                    >
                                        {article.urlToImage && !imageError && (
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={article.urlToImage}
                                                    alt={
                                                        article.title ||
                                                        article.description ||
                                                        "Imagem ilustrativa do artigo"
                                                    }
                                                    className={`w-full h-full object-cover ${
                                                        !reducedMotion
                                                            ? "hover:scale-110"
                                                            : ""
                                                    } ${transitionClass}`}
                                                    loading="lazy"
                                                    onError={() =>
                                                        handleImageError(
                                                            article.url,
                                                        )
                                                    }
                                                    itemProp="image"
                                                />
                                                {isRead && (
                                                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        Lido
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {imageError && (
                                            <div className="relative h-56 overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                                <Newspaper className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                                    {article.source?.name ||
                                                        "Fonte desconhecida"}
                                                </span>
                                                <time
                                                    dateTime={
                                                        article.publishedAt
                                                    }
                                                    className={`text-sm opacity-75 ${fontSizes[fontSize].card}`}
                                                    itemProp="datePublished"
                                                >
                                                    {new Date(
                                                        article.publishedAt,
                                                    ).toLocaleDateString(
                                                        "pt-BR",
                                                    )}
                                                </time>
                                            </div>

                                            <h3
                                                className={`${fontSizes[fontSize].subheading} font-bold mb-4 leading-tight`}
                                                itemProp="headline"
                                            >
                                                <button
                                                    onClick={() =>
                                                        openReadingMode(article)
                                                    }
                                                    className="hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors text-left w-full"
                                                    aria-label={`Ler artigo completo: ${article.title}`}
                                                >
                                                    {article.title}
                                                </button>
                                            </h3>

                                            <p
                                                className="opacity-90 mb-6 line-clamp-3"
                                                itemProp="description"
                                            >
                                                {article.description ||
                                                    "Sem descrição disponível"}
                                            </p>

                                            <div className="flex items-center justify-between gap-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() =>
                                                        toggleLikeArticle(
                                                            article,
                                                        )
                                                    }
                                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl min-h-[44px] font-medium ${
                                                        isLiked
                                                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200"
                                                            : colors.hover
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass}`}
                                                    aria-label={
                                                        isLiked
                                                            ? "Remover curtida"
                                                            : "Curtir artigo"
                                                    }
                                                    aria-pressed={isLiked}
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${
                                                            isLiked
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="sr-only sm:not-sr-only">
                                                        {isLiked
                                                            ? "Curtido"
                                                            : "Curtir"}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleSaveArticle(
                                                            article,
                                                        )
                                                    }
                                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl min-h-[44px] font-medium ${
                                                        isSaved
                                                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                                                            : colors.hover
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass}`}
                                                    aria-label={
                                                        isSaved
                                                            ? "Remover dos salvos"
                                                            : "Salvar artigo"
                                                    }
                                                    aria-pressed={isSaved}
                                                >
                                                    <Bookmark
                                                        className={`w-5 h-5 ${
                                                            isSaved
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="sr-only sm:not-sr-only">
                                                        {isSaved
                                                            ? "Salvo"
                                                            : "Salvar"}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        shareArticle(article)
                                                    }
                                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl ${colors.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 ${transitionClass} min-h-[44px] font-medium`}
                                                    aria-label="Compartilhar artigo"
                                                >
                                                    <Share2
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="sr-only sm:not-sr-only">
                                                        Compartilhar
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* Reading Mode Modal */}
            {readingMode && selectedArticle && (
                <div
                    ref={modalRef}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reading-mode-title"
                    aria-describedby="reading-mode-content"
                >
                    <div
                        className={`${colors.card} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 ${colors.border}`}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
                            <h2
                                id="reading-mode-title"
                                className={`${fontSizes[fontSize].heading} font-bold flex-1`}
                            >
                                Modo de Leitura
                            </h2>

                            <div className="flex items-center space-x-3">
                                {/* SPEAKER */}
                                <button
                                    onClick={() => {
                                        const text = `${selectedArticle.title}. ${
                                            selectedArticle.description ||
                                            selectedArticle.content ||
                                            ""
                                        }`;

                                        if (isSpeaking) {
                                            stopSpeech();
                                        } else {
                                            speakText(text);
                                        }
                                    }}
                                    className={`p-3 rounded-xl min-w-[44px] min-h-[44px] ${
                                        isSpeaking
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-white/20 hover:bg-white/30"
                                    } focus:outline-none focus:ring-2 focus:ring-white ${transitionClass}`}
                                    aria-label={
                                        isSpeaking
                                            ? "Parar leitura em voz alta"
                                            : "Iniciar leitura em voz alta"
                                    }
                                    aria-pressed={isSpeaking}
                                >
                                    {isSpeaking ? (
                                        <VolumeX
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Volume2
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>

                                {/* AA – ACESSIBILIDADE VISUAL */}
                                <button
                                    onClick={() => {
                                        setFontSize((prev) => {
                                            const next =
                                                prev === "medium"
                                                    ? "large"
                                                    : "medium";

                                            announce(
                                                next === "large"
                                                    ? "Fonte ampliada ativada"
                                                    : "Fonte padrão ativada",
                                            );

                                            return next;
                                        });
                                    }}
                                    className={`p-3 rounded-xl min-w-[44px] min-h-[44px] font-bold ${
                                        fontSize === "large"
                                            ? "bg-blue-800 hover:bg-blue-900"
                                            : "bg-white/20 hover:bg-white/30"
                                    } focus:outline-none focus:ring-2 focus:ring-white ${transitionClass}`}
                                    aria-label={
                                        fontSize === "large"
                                            ? "Desativar fonte ampliada"
                                            : "Ativar fonte ampliada"
                                    }
                                    aria-pressed={fontSize === "large"}
                                >
                                    AA
                                </button>

                                {/* FECHAR */}
                                <button
                                    ref={closeBtnRef}
                                    onClick={closeReadingMode}
                                    className="p-3 rounded-xl bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white transition-colors min-w-[44px] min-h-[44px]"
                                    aria-label="Fechar modo de leitura"
                                >
                                    <X className="w-6 h-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            id="reading-mode-content"
                            className="p-8 space-y-6"
                        >
                            {selectedArticle.urlToImage && (
                                <img
                                    src={selectedArticle.urlToImage}
                                    alt={
                                        selectedArticle.title ||
                                        selectedArticle.description ||
                                        "Imagem ilustrativa do artigo"
                                    }
                                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                                    onError={(e: any) => {
                                        e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='400' height='250' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImagem não disponível%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            )}

                            <h3
                                className={`${fontSizes[fontSize].heading} font-black leading-tight`}
                            >
                                {selectedArticle.title}
                            </h3>

                            <p
                                className={`${fontSizes[fontSize].subheading} leading-relaxed opacity-90`}
                            >
                                {selectedArticle.description}
                            </p>

                            {selectedArticle.content && (
                                <div
                                    className={`prose max-w-none ${
                                        darkMode ? "prose-invert" : ""
                                    }`}
                                >
                                    <p className="leading-relaxed">
                                        {selectedArticle.content}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer
                className={`${colors.card} border-t-2 ${colors.border} mt-20 shadow-lg`}
                role="contentinfo"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">
                                Amplifica
                            </h3>
                            <p className="opacity-75">
                                Plataforma de notícias totalmente acessível
                                seguindo WCAG 2.1 Nível AA
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">
                                Acessibilidade
                            </h3>
                            <ul className="space-y-2 opacity-75">
                                <li>✓ Compatível com leitores de tela</li>
                                <li>✓ Navegação por teclado</li>
                                <li>✓ Alto contraste</li>
                                <li>✓ Tamanhos de fonte ajustáveis</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Recursos</h3>
                            <ul className="space-y-2 opacity-75">
                                <li>✓ Leitura em voz alta</li>
                                <li>✓ Modo de leitura focado</li>
                                <li>✓ Salvar e curtir artigos</li>
                                <li>✓ Compartilhamento fácil</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                        <p className="opacity-75">
                            © 2026 Amplifica - Desenvolvido com foco em inclusão
                            digital
                        </p>
                        <p className="mt-2 text-sm opacity-60">
                            Dados fornecidos por News API
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AccessibleNewsApp;
