export type Lang = 'ES' | 'EN';

export interface Translation {
  // Header
  searchPlaceholder: string;
  catalog: string;
  favorites: string;
  admin: string;
  login: string;
  logout: string;
  logoutShort: string;
  menu: string;
  closeSession: string;

  // Catalog
  heroBadge: string;
  heroTitlePre: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  allTags: string;
  resultsSingular: string;
  resultsPlural: string;
  withTags: string;
  forQuery: string;
  noResultsTitle: string;
  noResultsMsg: string;

  // GameCard
  platformBoth: string;
  favorite: string;

  // GameDetail
  synopsis: string;
  downloadLinks: string;
  yourRating: string;
  ratedWith: string;
  clickToRate: string;
  comments: string;
  writeComment: string;
  loginToComment: string;
  noComments: string;
  anonymous: string;
  delete: string;
  close: string;
  send: string;

  // AuthModal
  welcomeBack: string;
  createAccount: string;
  signinSubtitle: string;
  signupSubtitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  nameRequired: string;
  passwordShort: string;
  signin: string;
  signup: string;
  noAccount: string;
  haveAccount: string;
  signupLink: string;
  signinLink: string;

  // Favorites
  noFavoritesTitle: string;
  noFavoritesMsg: string;
  exploreCatalog: string;
  myFavorites: string;
  savedSingular: string;
  savedPlural: string;

  // Admin
  adminPanel: string;
  adminSubtitle: string;
  settings: string;
  games: string;
  subscribers: string;
  siteSettings: string;
  siteTitle: string;
  logoUrl: string;
  logoPreview: string;
  save: string;
  saved: string;
  saveChanges: string;
  publishNewGame: string;
  newGame: string;
  title: string;
  titlePlaceholder: string;
  synopsisLabel: string;
  synopsisPlaceholder: string;
  platform: string;
  platformPC: string;
  platformAndroid: string;
  platformBothLabel: string;
  coverUrl: string;
  coverPlaceholder: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  downloadLinksLabel: string;
  serverPlaceholder: string;
  urlPlaceholder: string;
  addLink: string;
  publishGame: string;
  publishedGames: string;
  noGamesPublished: string;
  deleteGameConfirm: string;
  subscriberList: string;
  registered: string;
  noSubscribers: string;
  fillRequired: string;
  addDownloadLink: string;

  // App
  loading: string;
  footerSuffix: string;
}

const translations: Record<Lang, Translation> = {
  ES: {
    searchPlaceholder: 'Buscar juegos...',
    catalog: 'Catálogo',
    favorites: 'Favoritos',
    admin: 'Admin',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    logoutShort: 'Salir',
    menu: 'Menú',
    closeSession: 'Cerrar sesión',

    heroBadge: 'Novelas Visuales y Juegos de Historias',
    heroTitlePre: 'Descubre tu próxima ',
    heroTitleHighlight: 'aventura',
    heroSubtitle: 'Explora nuestra colección de novelas visuales y juegos de historias breves. Descarga gratis desde múltiples servidores.',
    allTags: 'Todos',
    resultsSingular: 'juego',
    resultsPlural: 'juegos',
    withTags: ' con ',
    forQuery: ' para "',
    noResultsTitle: 'No se encontraron juegos',
    noResultsMsg: 'Prueba con otros términos o etiquetas',

    platformBoth: 'PC + APK',
    favorite: 'Favorito',

    synopsis: 'Sinopsis',
    downloadLinks: 'Enlaces de Descarga',
    yourRating: 'Tu valoración',
    ratedWith: 'Has valorado con',
    clickToRate: 'Haz clic en las estrellas para valorar',
    comments: 'Comentarios',
    writeComment: 'Escribe un comentario...',
    loginToComment: 'Inicia sesión para dejar un comentario',
    noComments: 'Aún no hay comentarios. ¡Sé el primero!',
    anonymous: 'Anónimo',
    delete: 'Eliminar',
    close: 'Cerrar',
    send: 'Enviar',

    welcomeBack: 'Bienvenido de nuevo',
    createAccount: 'Crear cuenta',
    signinSubtitle: 'Inicia sesión para guardar favoritos y valorar juegos',
    signupSubtitle: 'Regístrate para unirte a la comunidad',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    email: 'Correo electrónico',
    emailPlaceholder: 'tucorreo@email.com',
    password: 'Contraseña',
    passwordPlaceholder: '••••••••',
    nameRequired: 'El nombre es obligatorio',
    passwordShort: 'La contraseña debe tener al menos 6 caracteres',
    signin: 'Iniciar sesión',
    signup: 'Registrarme',
    noAccount: '¿No tienes cuenta?',
    haveAccount: '¿Ya tienes cuenta?',
    signupLink: 'Regístrate',
    signinLink: 'Inicia sesión',

    noFavoritesTitle: 'Aún no tienes favoritos',
    noFavoritesMsg: 'Explora el catálogo y marca los juegos que te gustan con el botón del corazón. Aparecerán aquí para que los encuentres fácilmente.',
    exploreCatalog: 'Explorar catálogo',
    myFavorites: 'Mis Favoritos',
    savedSingular: 'juego guardado',
    savedPlural: 'juegos guardados',

    adminPanel: 'Panel de Administración',
    adminSubtitle: 'Gestiona el sitio, juegos y suscriptores',
    settings: 'Configuración',
    games: 'Juegos',
    subscribers: 'Suscriptores',
    siteSettings: 'Configuración del sitio',
    siteTitle: 'Título del sitio',
    logoUrl: 'URL del logo / banner',
    logoPreview: 'Vista previa del logo',
    save: 'Guardar cambios',
    saved: 'Guardado',
    saveChanges: 'Guardar cambios',
    publishNewGame: 'Publicar nuevo juego',
    newGame: 'Nuevo juego',
    title: 'Título',
    titlePlaceholder: 'Nombre del juego',
    synopsisLabel: 'Sinopsis',
    synopsisPlaceholder: 'Descripción del juego...',
    platform: 'Plataforma',
    platformPC: 'PC',
    platformAndroid: 'Android APK',
    platformBothLabel: 'Ambos',
    coverUrl: 'URL de Portada',
    coverPlaceholder: 'https://ejemplo.com/imagen.jpg',
    tagsLabel: 'Etiquetas / Tags (separadas por comas)',
    tagsPlaceholder: '3D, Anime, Terror, Romance...',
    downloadLinksLabel: 'Enlaces de Descarga',
    serverPlaceholder: 'Servidor (Mega, Drive...)',
    urlPlaceholder: 'https://...',
    addLink: 'Añadir otro enlace',
    publishGame: 'Publicar juego',
    publishedGames: 'Juegos publicados',
    noGamesPublished: 'No hay juegos publicados todavía',
    deleteGameConfirm: '¿Eliminar este juego?',
    subscriberList: 'Lista de suscriptores',
    registered: 'registrados',
    noSubscribers: 'No hay suscriptores todavía',
    fillRequired: 'Completa título, sinopsis y URL de portada',
    addDownloadLink: 'Agrega al menos un enlace de descarga',

    loading: 'Cargando...',
    footerSuffix: 'Novelas visuales y juegos de historias',
  },
  EN: {
    searchPlaceholder: 'Search games...',
    catalog: 'Catalog',
    favorites: 'Favorites',
    admin: 'Admin',
    login: 'Login',
    logout: 'Sign out',
    logoutShort: 'Exit',
    menu: 'Menu',
    closeSession: 'Sign out',

    heroBadge: 'Visual Novels and Short Story Games',
    heroTitlePre: 'Discover your next ',
    heroTitleHighlight: 'adventure',
    heroSubtitle: 'Explore our collection of visual novels and short story games. Download for free from multiple servers.',
    allTags: 'All',
    resultsSingular: 'game',
    resultsPlural: 'games',
    withTags: ' with ',
    forQuery: ' for "',
    noResultsTitle: 'No games found',
    noResultsMsg: 'Try different terms or tags',

    platformBoth: 'PC + APK',
    favorite: 'Favorite',

    synopsis: 'Synopsis',
    downloadLinks: 'Download Links',
    yourRating: 'Your rating',
    ratedWith: 'You rated with',
    clickToRate: 'Click the stars to rate',
    comments: 'Comments',
    writeComment: 'Write a comment...',
    loginToComment: 'Sign in to leave a comment',
    noComments: 'No comments yet. Be the first!',
    anonymous: 'Anonymous',
    delete: 'Delete',
    close: 'Close',
    send: 'Send',

    welcomeBack: 'Welcome back',
    createAccount: 'Create account',
    signinSubtitle: 'Sign in to save favorites and rate games',
    signupSubtitle: 'Sign up to join the community',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'youremail@email.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    nameRequired: 'Name is required',
    passwordShort: 'Password must be at least 6 characters',
    signin: 'Sign in',
    signup: 'Sign up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signupLink: 'Sign up',
    signinLink: 'Sign in',

    noFavoritesTitle: 'No favorites yet',
    noFavoritesMsg: 'Browse the catalog and mark the games you like with the heart button. They will appear here for easy access.',
    exploreCatalog: 'Browse catalog',
    myFavorites: 'My Favorites',
    savedSingular: 'saved game',
    savedPlural: 'saved games',

    adminPanel: 'Admin Panel',
    adminSubtitle: 'Manage the site, games, and subscribers',
    settings: 'Settings',
    games: 'Games',
    subscribers: 'Subscribers',
    siteSettings: 'Site settings',
    siteTitle: 'Site title',
    logoUrl: 'Logo / banner URL',
    logoPreview: 'Logo preview',
    save: 'Save',
    saved: 'Saved',
    saveChanges: 'Save changes',
    publishNewGame: 'Publish new game',
    newGame: 'New game',
    title: 'Title',
    titlePlaceholder: 'Game name',
    synopsisLabel: 'Synopsis',
    synopsisPlaceholder: 'Game description...',
    platform: 'Platform',
    platformPC: 'PC',
    platformAndroid: 'Android APK',
    platformBothLabel: 'Both',
    coverUrl: 'Cover URL',
    coverPlaceholder: 'https://example.com/image.jpg',
    tagsLabel: 'Tags (comma separated)',
    tagsPlaceholder: '3D, Anime, Horror, Romance...',
    downloadLinksLabel: 'Download Links',
    serverPlaceholder: 'Server (Mega, Drive...)',
    urlPlaceholder: 'https://...',
    addLink: 'Add another link',
    publishGame: 'Publish game',
    publishedGames: 'Published games',
    noGamesPublished: 'No games published yet',
    deleteGameConfirm: 'Delete this game?',
    subscriberList: 'Subscriber list',
    registered: 'registered',
    noSubscribers: 'No subscribers yet',
    fillRequired: 'Fill in title, synopsis, and cover URL',
    addDownloadLink: 'Add at least one download link',

    loading: 'Loading...',
    footerSuffix: 'Visual novels and story games',
  },
};

export default translations;
