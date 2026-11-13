# Пепельный лабиринт — Cryptbound

## Пепельный лабиринт (Cryptbound) · новая игра

**Актуальная сборка v0.6.2:** [APK/релиз](https://github.com/Domenklay/Baze_rpg/releases/tag/cryptbound-v0.6.2) · [Каталог 10 актов × 3 локации](cryptbound/docs/DUNGEONS_IMPLEMENTATION_2026-11-12.ru.md). Старое описание v0.4.0 ниже сохранено для истории.


**Новая самостоятельная игра:** пошаговый offline roguelike с исследованием скрытых плит в духе Gumballs & Dungeons, но со своими персонажами, названиями, сюжетными событиями и готическим визуальным оформлением.

**[Скачать установочный APK](https://github.com/Domenklay/Baze_rpg/releases/download/cryptbound-v0.4.0/Cryptbound-v0.4.0-offline-Android.apk)** · [Релиз](https://github.com/Domenklay/Baze_rpg/releases/tag/cryptbound-v0.4.0) · [Исходный код](cryptbound/).

- Шесть героев с оригинальными Idle/Attack/Skill спрайтами из RPG Clicker Infinity: двое воинов, двое ловкачей и двое магов.
- Поле 5×5 с исследованием от центральной клетки, ортогональной связностью и блокировкой соседних плит врагами. Один дальник появляется открытым и стреляет каждые три хода; призывы занимают свободную плиту.
- Восемь заклинаний, 45 узлов титулов в трёх разветвлённых ветках по пять ступеней; боссы через пять этажей.
- Сундуки, ловушки, торговцы, алтари, загадки и случайные пасхалки.
- Шесть регионов, 156 противников, 12 фиксированных комплектов T1–T2 с бонусами, 24 фиксированных вида оружия и материалами из RPG Clicker Infinity. Компактная экипировка с сетовыми бонусами; постоянные улучшения поселения за собранные материалы. Три универсальных ветки титулов, метапрогрессия героев, реликвии и испытания.
- Android APK компилируется GitHub Actions workflow \`.github/workflows/cryptbound.yml\`.

Проект Cryptbound собирается командой \`gradle :cryptbound:assembleDebug\`. Разрешение Android INTERNET отсутствует. Изображения персонажей, монстров, помещений и предметов представлены собственными векторными иллюстрациями.


## Разработка

Единственный Android-модуль — `cryptbound`; старый прототип Baze RPG удалён.

Требуются полный JDK 17, Gradle 8.9, Android SDK 35 и Node.js 20+.

```sh
node cryptbound/tests/smoke.cjs
node cryptbound/tests/sprites.cjs
gradle :cryptbound:assembleDebug --no-daemon --max-workers=4
```

Описание нового интерфейса: [компактный интерфейс](cryptbound/docs/UI_COMPACT.ru.md).
