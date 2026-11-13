/* Reference catalogue: 65 core Gumballs & Dungeons title mechanics, Nov 2026.
 * NOT loaded by game or wired to combat: upgrade model differs from current 45-node system.
 * Russian descriptions are newly authored. Sources listed in companion docs.
 */
window.CryptGumballsTitleReference = [
  {
    "id": "adv_seeker",
    "tree": 2,
    "rank": 1,
    "parents": [],
    "name": "Искатель сокровищ",
    "original_name": "Treasure Seeker",
    "mechanic": "При переходе на этаж показывает расположение 3/4/5 врагов.",
    "stats": "Атака +1/2/3",
    "ep_cost": [
      100,
      150,
      200
    ]
  },
  {
    "id": "adv_explorer",
    "tree": 2,
    "rank": 2,
    "parents": [
      "adv_seeker"
    ],
    "name": "Исследователь",
    "original_name": "Explorer",
    "mechanic": "Получает 10/15/20 ОИ при переходе на следующий этаж; выдаёт компас исследователя.",
    "stats": "HP +20/30/40",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "adv_explorationist",
    "tree": 2,
    "rank": 2,
    "parents": [
      "adv_seeker"
    ],
    "name": "Первопроходец",
    "original_name": "Explorationist",
    "mechanic": "Восстанавливает 6/9/12 HP на новом этаже; выдаёт исследовательский компас.",
    "stats": "HP +20/30/40",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "adv_night_walker",
    "tree": 2,
    "rank": 3,
    "parents": [
      "adv_explorer"
    ],
    "name": "Ночной странник",
    "original_name": "Night Walker",
    "mechanic": "Фонарь позволяет обнаруживать местонахождение ключа на этаже; вероятность растёт с уровнем.",
    "stats": "Атака +1/2/3; магия +1/2/3",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "adv_demon_hunter",
    "tree": 2,
    "rank": 3,
    "parents": [
      "adv_explorer"
    ],
    "name": "Охотник на демонов",
    "original_name": "Demon Hunter",
    "mechanic": "Получает лук; повышает урон по нежити на 10/15/20%.",
    "stats": "Атака +1/2/3; магия +1/2/3",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "adv_rune_master",
    "tree": 2,
    "rank": 3,
    "parents": [
      "adv_explorationist"
    ],
    "name": "Мастер рун",
    "original_name": "Rune Master",
    "mechanic": "Получает магический тигель: вероятность удвоить низкоранговые свитки.",
    "stats": "Магия +2/4/6",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "adv_blacksmith",
    "tree": 2,
    "rank": 3,
    "parents": [
      "adv_explorationist"
    ],
    "name": "Кузнец",
    "original_name": "Blacksmith",
    "mechanic": "Получает наковальню: разбор снаряжения может дать закалочную эссенцию.",
    "stats": "Атака +2/4/6",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "adv_magic_bandit",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_night_walker"
    ],
    "name": "Магический разбойник",
    "original_name": "Magic Bandit",
    "mechanic": "Выдаёт три предмета комплекта дворянина, уменьшающего цену изучения званий.",
    "stats": "Атака +1/2/3; магия +1/2/3; MP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_elven_ranger",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_night_walker",
      "adv_demon_hunter"
    ],
    "name": "Эльфийский следопыт",
    "original_name": "Elven Ranger",
    "mechanic": "На каждом уровне выдаёт статуэтку чёрной пантеры — призываемого союзника.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_treasure_hunter",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_demon_hunter"
    ],
    "name": "Охотник за сокровищами",
    "original_name": "Treasure Hunter",
    "mechanic": "Выдаёт три части комплекта охотника, увеличивающего добычу ОИ при убийствах.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_royal_rune",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_rune_master"
    ],
    "name": "Королевский мастер рун",
    "original_name": "Royal Rune Master",
    "mechanic": "Выдаёт комплект мастера рун; разбор свитков связан с дополнительной маной.",
    "stats": "Магия +2/4/6; MP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_weapon_master",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_rune_master",
      "adv_blacksmith"
    ],
    "name": "Мастер оружия",
    "original_name": "Weapon Master",
    "mechanic": "На изучении и улучшениях выдаёт лицензии мастера оружия, усиливающие атаку и магию.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_royal_blacksmith",
    "tree": 2,
    "rank": 4,
    "parents": [
      "adv_blacksmith"
    ],
    "name": "Королевский кузнец",
    "original_name": "Royal Blacksmith",
    "mechanic": "Выдаёт три части ремесленного комплекта, усиливающего получение ОИ при разборе вещей.",
    "stats": "Атака +2/4/6; HP +20/30/40",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "adv_god_thieves",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_magic_bandit"
    ],
    "name": "Бог воров",
    "original_name": "God of Thieves",
    "mechanic": "Улучшает фонарь: раскрывает скрытые объекты и события в дополнительных помещениях; улучшения дают воровские фитили.",
    "stats": "Атака, магия, HP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_farplane",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_magic_bandit",
      "adv_elven_ranger"
    ],
    "name": "Проводник загробного мира",
    "original_name": "Farplane Ranger",
    "mechanic": "После Ночного странника позволяет извлекать души из трупов; после Охотника на демонов — из убитых врагов. Даёт фитили либо загробные стрелы.",
    "stats": "Атака, магия, HP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_elf_king",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_elven_ranger",
      "adv_treasure_hunter"
    ],
    "name": "Великий король эльфов",
    "original_name": "Great Elf King",
    "mechanic": "После Ночного странника усиливает животных-призывов; после Охотника — автоматически стреляет при входе на этаж. Даёт эльфийские фитили/стрелы.",
    "stats": "Атака, магия, HP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_legendary_hunter",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_treasure_hunter"
    ],
    "name": "Легендарный охотник",
    "original_name": "Legendary Hunter",
    "mechanic": "Получает легендарный лук: автоматически поражает видимого врага каждые 5 ходов; улучшения дают особые стрелы.",
    "stats": "Атака, магия, HP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_holy_rune",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_royal_rune"
    ],
    "name": "Святой мастер рун",
    "original_name": "Holy Rune Master",
    "mechanic": "Улучшает тигель: позволяет объединять два одинаковых низкоранговых свитка в свиток следующего ранга.",
    "stats": "Магия, HP, MP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_great_enchanter",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_royal_rune",
      "adv_weapon_master"
    ],
    "name": "Великий зачарователь",
    "original_name": "Great Enchanter",
    "mechanic": "После Мастера рун тигель добавляет магический урон к атакам; после Кузнеца наковальня улучшает магические комплекты.",
    "stats": "Магия, HP, MP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_great_swordsmith",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_weapon_master",
      "adv_royal_blacksmith"
    ],
    "name": "Великий оружейник",
    "original_name": "Great Swordsmith",
    "mechanic": "После Мастера рун тигель даёт шанс избежать ответа врага; после Кузнеца наковальня улучшает воинские комплекты.",
    "stats": "Атака, HP, MP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "adv_holy_blacksmith",
    "tree": 2,
    "rank": 5,
    "parents": [
      "adv_royal_blacksmith"
    ],
    "name": "Святой кузнец",
    "original_name": "Holy Blacksmith",
    "mechanic": "Улучшает наковальню: изготовление предметов 6-го ранга из закалочных эссенций.",
    "stats": "Атака, HP, MP; по три улучшения каждого типа",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_novice",
    "tree": 0,
    "rank": 1,
    "parents": [],
    "name": "Начинающий воин",
    "original_name": "Novice Warrior",
    "mechanic": "Обычная атака с вероятностью 10/15/20% блокирует ответный удар врага.",
    "stats": "Атака +1/2/3",
    "ep_cost": [
      100,
      150,
      200
    ]
  },
  {
    "id": "war_fighter",
    "tree": 0,
    "rank": 2,
    "parents": [
      "war_novice"
    ],
    "name": "Боец",
    "original_name": "Fighter",
    "mechanic": "Увеличивает атаку на 10/15/20%.",
    "stats": "Атака +1/2/3",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "war_knight",
    "tree": 0,
    "rank": 2,
    "parents": [
      "war_novice"
    ],
    "name": "Рыцарь",
    "original_name": "Knight",
    "mechanic": "Увеличивает максимальное HP на 10/20/30%.",
    "stats": "HP +20/40/60",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "war_magic",
    "tree": 0,
    "rank": 3,
    "parents": [
      "war_fighter"
    ],
    "name": "Магический воин",
    "original_name": "Magic Warrior",
    "mechanic": "Обычная атака с шансом 10/15/20% добавляет урон, равный магической силе; разрешает свитки земли, огня и тьмы 3/4/5 ранга.",
    "stats": "Атака +1/2/3; магия +1/2/3; MP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "war_dancer",
    "tree": 0,
    "rank": 3,
    "parents": [
      "war_fighter"
    ],
    "name": "Мастер меча",
    "original_name": "Sword Dancer",
    "mechanic": "Даёт по свитку техники меча на уровень; разрешает свитки огня, воздуха и тьмы 3/4/5 ранга.",
    "stats": "Атака +2/4/6; HP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "war_silver",
    "tree": 0,
    "rank": 3,
    "parents": [
      "war_knight"
    ],
    "name": "Серебряный рыцарь",
    "original_name": "Silver Knight",
    "mechanic": "При убийстве противника возвращает 1/2/3 HP; разрешает свитки земли, воды и света 3/4/5 ранга.",
    "stats": "Атака +2/4/6; HP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "war_faith",
    "tree": 0,
    "rank": 3,
    "parents": [
      "war_knight"
    ],
    "name": "Рыцарь веры",
    "original_name": "Knight of Faith",
    "mechanic": "При каждом улучшении получает святой герб; разрешает свитки воды, воздуха и света 3/4/5 ранга.",
    "stats": "Атака +1/2/3; магия +1/2/3; MP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "war_shadow",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_magic"
    ],
    "name": "Теневой воин",
    "original_name": "Shadow Warrior",
    "mechanic": "После убийства призывает тёмную душу; её урон равен 20/30/40% атаки героя.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_dragon",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_magic",
      "war_dancer"
    ],
    "name": "Драконий воин",
    "original_name": "Dragon Warrior",
    "mechanic": "Убитый враг с вероятностью 20/30/40% создаёт огненный клинок, бьющий по строке и столбцу.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_great_sword",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_dancer"
    ],
    "name": "Великий мастер меча",
    "original_name": "Great Sword Master",
    "mechanic": "Получает улучшенные свитки фехтования на каждом уровне.",
    "stats": "Атака +2/4/6; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_royal",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_silver"
    ],
    "name": "Королевский рыцарь",
    "original_name": "Royal Knight",
    "mechanic": "Каждое убийство прибавляет 1/2/3 атаки до конца текущего этажа.",
    "stats": "Атака +2/4/6; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_heavy",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_silver",
      "war_faith"
    ],
    "name": "Тяжёлый рыцарь",
    "original_name": "Heavy Armor Knight",
    "mechanic": "Снижает урон от дальнобойных врагов на 20/30/40%.",
    "stats": "Атака +2/4/6; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_templar",
    "tree": 0,
    "rank": 4,
    "parents": [
      "war_faith"
    ],
    "name": "Храмовник",
    "original_name": "Templar",
    "mechanic": "Увеличивает наносимый нежити урон на 50/75/100%.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +40/60/80",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "war_dark_arbiter",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_shadow"
    ],
    "name": "Тёмный судья",
    "original_name": "Dark Arbiter",
    "mechanic": "При обычной атаке есть шанс 5% активировать Волну смерти.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_duke",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_shadow",
      "war_dragon"
    ],
    "name": "Герцог разрушения",
    "original_name": "Duke of Destruction",
    "mechanic": "После убийства врага шанс 10% автоматически применить Клинок разрушения.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_hell",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_dragon"
    ],
    "name": "Бог войны преисподней",
    "original_name": "War God of Hell",
    "mechanic": "При обычной атаке шанс 5% автоматически вызвать Метеоритный дождь.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_sword_sage",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_great_sword"
    ],
    "name": "Мудрец меча",
    "original_name": "Sword Sage",
    "mechanic": "При изучении увеличивает текущую атаку на 30%.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_warrior",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_great_sword",
      "war_royal"
    ],
    "name": "Герой",
    "original_name": "Warrior",
    "mechanic": "Наносит боссам дополнительно 50% урона при обычной атаке.",
    "stats": "Улучшения атаки, MP и HP; дополнительные бонусы против босса",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_commander",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_royal",
      "war_heavy"
    ],
    "name": "Имперский командир",
    "original_name": "Imperial Commander",
    "mechanic": "При изучении выдаёт сокровище 6-го ранга.",
    "stats": "Улучшения атаки, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_titan",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_heavy"
    ],
    "name": "Рыцарь титанов",
    "original_name": "Titan Knight",
    "mechanic": "Обычные атаки с вероятностью 5% накладывают Земляной шип.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_paladin",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_templar"
    ],
    "name": "Паладин света",
    "original_name": "Light Paladin",
    "mechanic": "При изучении увеличивает HP на 10% и полностью исцеляет.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "war_light_arbiter",
    "tree": 0,
    "rank": 5,
    "parents": [
      "war_templar"
    ],
    "name": "Судья света",
    "original_name": "Light Arbiter",
    "mechanic": "После убийства врага с шансом 10% применяет Святой луч.",
    "stats": "Улучшения атаки, магии и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_apprentice",
    "tree": 1,
    "rank": 1,
    "parents": [],
    "name": "Ученик мага",
    "original_name": "Magic Apprentice",
    "mechanic": "Даёт 3 Благословения на каждом уровне; разрешает заклинания до 3/4/5 ранга.",
    "stats": "Атака +1/2/3",
    "ep_cost": [
      100,
      150,
      200
    ]
  },
  {
    "id": "mag_black",
    "tree": 1,
    "rank": 2,
    "parents": [
      "mag_apprentice"
    ],
    "name": "Чёрный маг",
    "original_name": "Black Mage",
    "mechanic": "Даёт 3 Огненных шара на каждом уровне; усиливает магию на 10/15/20%.",
    "stats": "Магия +1/2/3",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "mag_white",
    "tree": 1,
    "rank": 2,
    "parents": [
      "mag_apprentice"
    ],
    "name": "Белый маг",
    "original_name": "White Mage",
    "mechanic": "Даёт 3 Лечения на каждом уровне; увеличивает MP на 10/20/30%.",
    "stats": "MP +20/40/60",
    "ep_cost": [
      200,
      250,
      300
    ]
  },
  {
    "id": "mag_wizard",
    "tree": 1,
    "rank": 3,
    "parents": [
      "mag_black"
    ],
    "name": "Волшебник",
    "original_name": "Wizard",
    "mechanic": "Даёт 2 Метеоритных дождя на каждом уровне; шанс 20/30/40% вызвать стихийный вихрь при уроне магией.",
    "stats": "Магия +2/4/6; HP +10/20/30; MP +10/20/30",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "mag_conjuror",
    "tree": 1,
    "rank": 3,
    "parents": [
      "mag_black"
    ],
    "name": "Призыватель",
    "original_name": "Conjuror",
    "mechanic": "Даёт 3 Волны смерти; после убийства появляется тотем на 3/6/9 ходов.",
    "stats": "Магия +2/4/6; HP +10/20/30; MP +10/20/30",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "mag_priest",
    "tree": 1,
    "rank": 3,
    "parents": [
      "mag_white"
    ],
    "name": "Жрец",
    "original_name": "Priest",
    "mechanic": "Даёт 3 Святых луча; восстанавливает 3/6/9 HP и MP при переходе на этаж.",
    "stats": "Атака +1/2/3; магия +2/4/6; HP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "mag_bishop",
    "tree": 1,
    "rank": 3,
    "parents": [
      "mag_white"
    ],
    "name": "Оракул",
    "original_name": "Bishop / Oracle",
    "mechanic": "Даёт 3 Ледяных щита; при исцелении на текущем этаже повышает атаку на 5/10/15.",
    "stats": "Атака +1/2/3; магия +1/2/3; HP +20/40/60",
    "ep_cost": [
      300,
      350,
      400
    ]
  },
  {
    "id": "mag_fire",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_wizard"
    ],
    "name": "Мастер огня",
    "original_name": "Fire Master",
    "mechanic": "Даёт 5 Огненных шаров на каждом уровне; усиливает магию огня на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_dark",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_wizard",
      "mag_conjuror"
    ],
    "name": "Мастер тьмы",
    "original_name": "Dark Master",
    "mechanic": "Даёт 4 Волны смерти; усиливает магию тьмы на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_earth",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_conjuror"
    ],
    "name": "Мастер земли",
    "original_name": "Earth Master",
    "mechanic": "Даёт 2 Гравитации; усиливает магию земли на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_air",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_priest"
    ],
    "name": "Мастер воздуха",
    "original_name": "Air Master",
    "mechanic": "Даёт 5 Молний; усиливает магию воздуха на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_light",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_priest",
      "mag_bishop"
    ],
    "name": "Мастер света",
    "original_name": "Light Master",
    "mechanic": "Даёт 4 Святых луча; усиливает магию света на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_water",
    "tree": 1,
    "rank": 4,
    "parents": [
      "mag_bishop"
    ],
    "name": "Мастер воды",
    "original_name": "Water Master",
    "mechanic": "Даёт 3 Ледяных копья; усиливает магию воды на 20/30/40%.",
    "stats": "Магия +2/4/6; HP +20/40/60; MP +20/40/60",
    "ep_cost": [
      400,
      450,
      500
    ]
  },
  {
    "id": "mag_destruction",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_fire"
    ],
    "name": "Маг разрушения",
    "original_name": "Mage of Destruction",
    "mechanic": "Огненный шар с вероятностью 12% превращается в Армагеддон; усиления повышают шанс и силу.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_elements",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_fire",
      "mag_dark"
    ],
    "name": "Повелитель стихий",
    "original_name": "Lord of the Elements",
    "mechanic": "Урон всех боевых заклинаний +30%.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_dark_priest",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_dark"
    ],
    "name": "Тёмный жрец",
    "original_name": "Dark Priest",
    "mechanic": "С вероятностью 50% заклинания тьмы наносят двойной урон.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_planar",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_earth"
    ],
    "name": "Планарный пророк",
    "original_name": "Planar Prophet",
    "mechanic": "Усиливает Врата земли: позволяет вернуться на более ранние этажи и увеличивает дальность возврата.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_legendary",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_earth",
      "mag_air"
    ],
    "name": "Легендарный маг",
    "original_name": "Legendary Mage",
    "mechanic": "Все вспомогательные заклинания эффективнее на 30%.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_time",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_air"
    ],
    "name": "Повелитель времени",
    "original_name": "Time Lord",
    "mechanic": "Заклинания воздуха с шансом 50% останавливают время на один ход, не работает против боссов.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_pope",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_light"
    ],
    "name": "Понтифик",
    "original_name": "Pope",
    "mechanic": "Урон заклинаний света может сработать повторно.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_light_bishop",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_light",
      "mag_water"
    ],
    "name": "Епископ света",
    "original_name": "Light Bishop / Light Oracle",
    "mechanic": "Усиливает все целебные заклинания на 30%.",
    "stats": "Улучшения магии, атаки и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  },
  {
    "id": "mag_archbishop",
    "tree": 1,
    "rank": 5,
    "parents": [
      "mag_water"
    ],
    "name": "Архиепископ",
    "original_name": "Archbishop",
    "mechanic": "Ледяной щит с вероятностью 15% заменяется Барьером Авроры.",
    "stats": "Улучшения магии, MP и HP",
    "ep_cost": [
      500
    ],
    "enhancements": {
      "attack_or_power": 3,
      "defensive_stat_1": 3,
      "defensive_stat_2": 3,
      "cost_each": 500
    }
  }
];
