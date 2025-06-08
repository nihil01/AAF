export type Language = 'en' | 'az' | 'ru';

export interface Translations {
  common: {
    back: string;
    loading: string;
    settings: string;
    profile: string;
    home: string;
    save: string;
    cancel: string;
    error: string;
    connections: string;
    map: string;
    information: string;
    settingsTitle: string;
  };
  map: {
    trackingOn: string;
    trackingOff: string;
    cordsClicked: string;
    locationPermissionDenied: string;
    openSettings: string;
    locationNeeded: string;
  };
  settings: {
    darkMode: string;
    language: string;
    transparentUI: string;
    notifications: string;
    about: string;
    logout: string;
    contactAdmin: string;
    appVersion: string;
    pushRegistrationFailed: string;
  };
  profile: {
    editProfile: string;
    username: string;
    email: string;
    phone: string;
    location: string;
    lastSeen: string;
  };
  homePage: {
    myGarage: string;
    settings: string;
  };
  carComponent: {
    addYourPrideAndJoy: string;
    back: string;
    carDetails: string;
    addYourCar: string;
    make: string;
    makePlaceholder: string;
    model: string;
    modelPlaceholder: string;
    year: string;
    engineSpecs: string;
    engineSpecsPlaceholder: string;
    horsePower: string;
    torque: string;
    torquePlaceholder: string;
    zeroToHundred: string;
    zeroToHundredPlaceholder: string;
    carStory: string;
    carStoryPlaceholder: string;
    addModification: string;
    noModifications: string;
    addPhotos: string;
    choosePhotoSource: string;
    takePhoto: string;
    chooseFromFiles: string;
    cancel: string;
    saveCar: string;
    maximumPhotosReached: string;
    maximumPhotosMessage: string;
    ok: string;
    modifications: string;
    selectModification: string;
    chooseCategory: string;
    backToCategories: string;
    addToModifications: string;
    performance: string;
    engine: string;
    story: string;
    submitting: string;
    submissionSuccess: string;
    submissionError: string;
    loading: string;
    fetchError: string;
    deleteCar: string;
    deleteCarConfirmation: string;
    deleteCarSuccess: string;
    deleteCarError: string;
  };
  onboarding: {
    findCars: string;
    findCarsDesc: string;
    mapView: string;
    mapViewDesc: string;
    connections: string;
    connectionsDesc: string;
    notifications: string;
    notificationsDesc: string;
    getStarted: string;
    skip: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: 'Back',
      loading: 'Loading...',
      settings: 'Settings',
      profile: 'Profile',
      home: 'Home',
      save: 'Save',
      cancel: 'Cancel',
      error: 'Error',
      connections: 'Connections',
      map: 'Map',
      information: 'Information',
      settingsTitle: 'Settings'
    },
    map: {
      trackingOn: 'Tracking On',
      trackingOff: 'Tracking Off',
      cordsClicked: 'Coordinates clicked',
      locationPermissionDenied: 'Location permission not granted',
      openSettings: 'Open settings?',
      locationNeeded: 'This app needs your location.'
    },
    settings: {
      darkMode: 'Dark Mode',
      language: 'Language',
      transparentUI: 'Transparent UI',
      notifications: 'Notifications',
      about: 'About',
      logout: 'Logout',
      contactAdmin: 'Contact Admin',
      appVersion: 'App Version',
      pushRegistrationFailed: 'Push registration failed. You can enable it manually in settings.'
    },
    profile: {
      editProfile: 'Edit Profile',
      username: 'Username',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      lastSeen: 'Last Seen'
    },
    homePage: {
      myGarage: 'My Garage',
      settings: 'Settings'
    },
    carComponent: {
      addYourPrideAndJoy: 'Add Your Vehicle',
      back: 'Back',
      carDetails: 'Car Details',
      addYourCar: 'Add Your Car',
      make: 'Make',
      makePlaceholder: 'Ferrari, Lamborghini, BMW...',
      model: 'Model',
      modelPlaceholder: 'F40, Aventador, M3...',
      year: 'Year',
      engineSpecs: 'Engine Specs',
      engineSpecsPlaceholder: 'V8, 4.0L Twin-Turbo...',
      horsePower: 'Horsepower',
      torque: 'Torque',
      torquePlaceholder: '500 lb-ft',
      zeroToHundred: '0-100 Time',
      zeroToHundredPlaceholder: '3.2s',
      carStory: "Your Car's Story",
      carStoryPlaceholder: 'Tell us about your car...',
      addModification: 'Add Modification',
      noModifications: 'No modifications yet, try adding some',
      addPhotos: 'Add Photos',
      choosePhotoSource: 'Choose Photo Source',
      takePhoto: 'Take Photo',
      chooseFromFiles: 'Choose from Files',
      cancel: 'Cancel',
      saveCar: 'Save Car',
      maximumPhotosReached: 'Maximum Photos Reached',
      maximumPhotosMessage: 'You can only add up to 5 photos.',
      ok: 'OK',
      modifications: 'Modifications',
      selectModification: 'Select Modification',
      chooseCategory: 'Choose Category',
      backToCategories: 'Back to Categories',
      addToModifications: 'Add to Modifications',
      performance: 'Performance',
      engine: 'Engine',
      story: 'Story',
      submitting: 'Submitting...',
      submissionSuccess: 'Car details saved successfully!',
      submissionError: 'Failed to save car details. Please try again.',
      loading: 'Loading...',
      fetchError: 'Failed to fetch vehicle data',
      deleteCar: 'Delete Car',
      deleteCarConfirmation: 'Are you sure you want to delete this car?',
      deleteCarSuccess: 'Car deleted successfully!',
      deleteCarError: 'Failed to delete car. Please try again.'
    },
    onboarding: {
      findCars: 'Find Cars',
      findCarsDesc: 'Discover and connect with car owners in your area',
      mapView: 'Map View',
      mapViewDesc: 'View available cars on an interactive map',
      connections: 'Connections',
      connectionsDesc: 'Build your network of car owners and enthusiasts',
      notifications: 'Stay Updated',
      notificationsDesc: 'Get real-time notifications about new opportunities',
      getStarted: 'Get Started',
      skip: 'Skip'
    }
  },
  az: {
    common: {
      back: 'Geri',
      loading: 'Yüklənir...',
      settings: 'Parametrlər',
      profile: 'Profil',
      home: 'Ana Səhifə',
      save: 'Yadda Saxla',
      cancel: 'Ləğv Et',
      error: 'Xəta',
      connections: 'Əlaqələr',
      map: 'Xəritə',
      information: 'Məlumat',
      settingsTitle: 'Parametrlər'
    },
    map: {
      trackingOn: 'İzlənmə Aktivdir',
      trackingOff: 'İzlənmə Deaktivdir',
      cordsClicked: 'Koordinatlar seçildi',
      locationPermissionDenied: 'Məkan icazəsi verilmədi',
      openSettings: 'Parametrləri açmaq?',
      locationNeeded: 'Bu tətbiq sizin məkanınıza ehtiyac duyur.'
    },
    settings: {
      darkMode: 'Qaranlıq Rejim',
      language: 'Dil',
      transparentUI: 'Şəffaf İnterfeys',
      notifications: 'Bildirişlər',
      about: 'Haqqında',
      logout: 'Çıxış',
      contactAdmin: 'Admin ilə Əlaqə',
      appVersion: 'Tətbiq Versiyası',
      pushRegistrationFailed: 'Push qeydiyyatı uğursuz oldu. Parametrlərdən əl ilə aktivləşdirə bilərsiniz.'
    },
    profile: {
      editProfile: 'Profili Düzəlt',
      username: 'İstifadəçi Adı',
      email: 'E-poçt',
      phone: 'Telefon',
      location: 'Məkan',
      lastSeen: 'Son Görünüş'
    },
    homePage: {
      myGarage: 'Garajım',
      settings: 'Parametrlər'
    },
    carComponent: {
      addYourPrideAndJoy: 'Sizin transportunuzu əlavə edin',
      back: 'Geri',
      carDetails: 'Avtomobil Detalları',
      addYourCar: 'Avtomobilinizi Əlavə Edin',
      make: 'Marka',
      makePlaceholder: 'Ferrari, Lamborghini, BMW...',
      model: 'Model',
      modelPlaceholder: 'F40, Aventador, M3...',
      year: 'İl',
      engineSpecs: 'Mühərrik Xüsusiyyətləri',
      engineSpecsPlaceholder: 'V8, 4.0L Twin-Turbo...',
      horsePower: 'At Gücü',
      torque: 'Tork',
      torquePlaceholder: '500 lb-ft',
      zeroToHundred: '0-100 Vaxtı',
      zeroToHundredPlaceholder: '3.2s',
      carStory: 'Avtomobilinizin Hekayəsi',
      carStoryPlaceholder: 'Avtomobiliniz haqqında bizə danışın...',
      addModification: 'Modifikasiya Əlavə Et',
      noModifications: 'Hələ modifikasiya yoxdur, əlavə etməyə çalışın',
      addPhotos: 'Şəkil Əlavə Et',
      choosePhotoSource: 'Şəkil Mənbəyini Seçin',
      takePhoto: 'Şəkil Çəkin',
      chooseFromFiles: 'Fayllardan Seçin',
      cancel: 'Ləğv Et',
      saveCar: 'Avtomobili Yadda Saxla',
      maximumPhotosReached: 'Maksimum Şəkil Sayına Çatıldı',
      maximumPhotosMessage: 'Yalnız 5 şəkil əlavə edə bilərsiniz.',
      ok: 'OK',
      modifications: 'Modifikasiyalar',
      selectModification: 'Modifikasiya Seçin',
      chooseCategory: 'Kateqoriya Seçin',
      backToCategories: 'Kateqoriyalara Qayıt',
      addToModifications: 'Modifikasiyalara Əlavə Et',
      performance: 'Performans',
      engine: 'Mühərrik',
      story: 'Hekayə',
      submitting: 'Göndərilir...',
      submissionSuccess: 'Avtomobil məlumatları uğurla yadda saxlanıldı!',
      submissionError: 'Avtomobil məlumatlarını yadda saxlamaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.',
      loading: 'Yüklənir...',
      fetchError: 'Avtomobil məlumatlarını yükləmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.',
      deleteCar: 'Avtomobil Sil',
      deleteCarConfirmation: 'Bu avtomobilinizi silmək istədiyinizə əminsinizmi?',
      deleteCarSuccess: 'Avtomobil uğurla silindi!',
      deleteCarError: 'Avtomobil silmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.'
    },
    onboarding: {
      findCars: 'Avtomobil Tapın',
      findCarsDesc: 'Ərazinizdəki avtomobil sahibləri ilə əlaqə qurun',
      mapView: 'Xəritə Görünüşü',
      mapViewDesc: 'Mövcud avtomobilləri interaktiv xəritədə görün',
      connections: 'Əlaqələr',
      connectionsDesc: 'Avtomobil sahibləri və həvəskarları ilə şəbəkənizi qurun',
      notifications: 'Yeniliklərdən Xəbərdar Olun',
      notificationsDesc: 'Yeni imkanlar haqqında real vaxt bildirişləri alın',
      getStarted: 'Başlayaq',
      skip: 'Keç'
    }
  },
  ru: {
    common: {
      back: 'Назад',
      loading: 'Загрузка...',
      settings: 'Настройки',
      profile: 'Профиль',
      home: 'Главная',
      save: 'Сохранить',
      cancel: 'Отмена',
      error: 'Ошибка',
      connections: 'Связи',
      map: 'Карта',
      information: 'Информация',
      settingsTitle: 'Настройки'
    },
    map: {
      trackingOn: 'Отслеживание Включено',
      trackingOff: 'Отслеживание Выключено',
      cordsClicked: 'Координаты выбраны',
      locationPermissionDenied: 'Доступ к местоположению запрещен',
      openSettings: 'Открыть настройки?',
      locationNeeded: 'Это приложение требует доступ к вашему местоположению.'
    },
    settings: {
      darkMode: 'Темная Тема',
      language: 'Язык',
      transparentUI: 'Прозрачный Интерфейс',
      notifications: 'Уведомления',
      about: 'О Приложении',
      logout: 'Выйти',
      contactAdmin: 'Связаться с Админом',
      appVersion: 'Версия Приложения',
      pushRegistrationFailed: 'Ошибка регистрации push-уведомлений. Вы можете включить их вручную в настройках.'
    },
    profile: {
      editProfile: 'Редактировать Профиль',
      username: 'Имя Пользователя',
      email: 'Эл. Почта',
      phone: 'Телефон',
      location: 'Местоположение',
      lastSeen: 'Последний Визит'
    },
    homePage: {
      myGarage: 'Мой гараж',
      settings: 'Настройки'
    },
    carComponent: {
      addYourPrideAndJoy: 'Добавьте свое транспортное средство',
      back: 'Назад',
      carDetails: 'Детали Автомобиля',
      addYourCar: 'Добавить Автомобиль',
      make: 'Марка',
      makePlaceholder: 'Ferrari, Lamborghini, BMW...',
      model: 'Модель',
      modelPlaceholder: 'F40, Aventador, M3...',
      year: 'Год',
      engineSpecs: 'Характеристики Двигателя',
      engineSpecsPlaceholder: 'V8, 4.0L Twin-Turbo...',
      horsePower: 'Лошадиные Силы',
      torque: 'Крутящий Момент',
      torquePlaceholder: '500 lb-ft',
      zeroToHundred: 'Разгон 0-100',
      zeroToHundredPlaceholder: '3.2s',
      carStory: 'История Вашего Автомобиля',
      carStoryPlaceholder: 'Расскажите нам о вашем автомобиле...',
      addModification: 'Добавить Модификацию',
      noModifications: 'Пока нет модификаций, попробуйте добавить',
      addPhotos: 'Добавить Фото',
      choosePhotoSource: 'Выберите Источник Фото',
      takePhoto: 'Сделать Фото',
      chooseFromFiles: 'Выбрать из Файлов',
      cancel: 'Отмена',
      saveCar: 'Сохранить Автомобиль',
      maximumPhotosReached: 'Достигнуто Максимальное Количество Фото',
      maximumPhotosMessage: 'Вы можете добавить только 5 фотографий.',
      ok: 'OK',
      modifications: 'Модификации',
      selectModification: 'Выбрать Модификацию',
      chooseCategory: 'Выбрать Категорию',
      backToCategories: 'Назад к Категориям',
      addToModifications: 'Добавить к Модификациям',
      performance: 'Производительность',
      engine: 'Двигатель',
      story: 'История',
      submitting: 'Отправка...',
      submissionSuccess: 'Данные автомобиля успешно сохранены!',
      submissionError: 'Не удалось сохранить данные автомобиля. Пожалуйста, попробуйте снова.',
      loading: 'Загрузка...',
      fetchError: 'Не удалось загрузить данные автомобиля. Пожалуйста, попробуйте снова.',
      deleteCar: 'Удалить Автомобиль',
      deleteCarConfirmation: 'Вы уверены, что хотите удалить этот автомобиль?',
      deleteCarSuccess: 'Автомобиль успешно удален!',
      deleteCarError: 'Не удалось удалить автомобиль. Пожалуйста, попробуйте снова.'
    },
    onboarding: {
      findCars: 'Найдите Автомобили',
      findCarsDesc: 'Откройте и свяжитесь с владельцами автомобилей в вашем районе',
      mapView: 'Просмотр Карты',
      mapViewDesc: 'Просматривайте доступные автомобили на интерактивной карте',
      connections: 'Связи',
      connectionsDesc: 'Создайте свою сеть владельцев автомобилей и энтузиастов',
      notifications: 'Будьте в Курсе',
      notificationsDesc: 'Получайте уведомления в реальном времени о новых возможностях',
      getStarted: 'Начать',
      skip: 'Пропустить'
    }
  }
};

export default translations; 