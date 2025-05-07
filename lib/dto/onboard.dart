class Onboard{

  final String title;
  final String description;
  final String asset;

  Onboard({required this.title,required this.description,required this.asset});


  //TODO ADD LOCALIZATIONS FOR LANGUAGES (RU, EN, AZ)
  static List<Onboard> getOnboard(){
    return <Onboard>[
      Onboard(title: "🚗 Добро пожаловать в CarMeet — сообщество автолюбителей!",
          description: "Знакомься, общайся и находи единомышленников прямо в своём городе.",
          asset: "lib/assets/police.png"),

      Onboard(title: "🔍 У тебя BMW X5M? Audi RS7? Или Tesla?",
          description: "Узнай, кто рядом с тобой на таких же колесах!",
          asset: "lib/assets/police.png"),

      Onboard(title: "📍 Хочешь собраться на кофе или устроить мини-сходку?",
          description: "Создавай встречи и делись своей геолокацией в реальном времени.",
          asset: "lib/assets/police.png"),

      Onboard(title: "🛠 Создай профиль, добавь информацию об авто, и стань частью сообщества уже сегодня!",
          description: "Готовы начать ?",
          asset: "lib/assets/police.png"),

    ];
  }


}