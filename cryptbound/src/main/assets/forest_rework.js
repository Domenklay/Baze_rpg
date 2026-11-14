/* Forest Outskirts v2: 50 linked choices with working rewards; original approved sprite IDs retained.
   This module extends the proven hunter book / alpha trophy / well systems rather than replacing them. */
(function(){'use strict';
var FE=window.CryptForestEvents;
if(!FE)throw Error('forest_encounters.js must load before forest_rework.js');
function rewrite(id,title,text,choices,need,repeat){
 var e=FE.scene(id);if(!e)throw Error('Missing forest quest '+id);
 if(title)e.title=title;if(text)e.text=text;if(choices)e.choices=choices;
 if(need!==undefined)e.need=need;
 if(repeat!==undefined)e.repeat=!!repeat;
}
rewrite(1,'Рыжуха и волчья стая','Рыжуха прижата к старому пню тремя волками. Она обещает показать тайники и познакомить героя с хранителями леса, если он спасёт её.',null);
rewrite(2,'Лесной колодец желаний','Колодец принимает монеты и редкий дар Рыжухи. Сила зависит от того, что в него опустили. Отдельная встреча с вероятностью 25%.',null);
rewrite(3,'Капкан на звериной тропе','Между корнями спрятан исправный охотничий капкан. Здесь недавно проходили браконьеры.',[
 'Снять капкан и положить в рюкзак|item:bleed_trap:1',
 'Использовать капкан против секача|fight:boar:1:trap',
 'Отследить поставившего его охотника|flag:poacher_tracks;item:snare_wire:1',
 'Оставить на месте|leave']);
rewrite(4,'Лисица с чёрными лапами','В клетке заперта редкая чёрнолапая лисица. На прутьях — клеймо браконьеров; зверёк боится даже пищи.',[
 'Освободить и обработать раны|flag:fox_freed;item:forest_moss:1',
 'Оставить пищу и понаблюдать|item:fox_scent:1;flag:fox_contact',
 'Взять охотничьи силки, не трогая зверя|item:bleed_trap:2',
 'Вернуться позднее|leave']);
rewrite(5,'Потерянная карта лесничего','Корни обвили металлическую коробку с половиной карты сторожевых троп. Карандашом отмечен дозорный пост и три незаметных схрона.',[
 'Взять карту для поисков схронов|item:map_scrap:1;flag:map_first',
 'Перерисовать маршрут на память|flag:map_first;item:waymark:1',
 'Положить карту обратно|leave']);
rewrite(6,'Травник под упавшей елью','Из-под поваленного ствола зовёт раненый травник. Его сумка с целебными мазями лежит рядом с гнездом хищных жуков.',[
 'Оттащить ствол при помощи рычага|flag:herbalist_saved;item:healing_salve:2',
 'Отвлечь жуков и собрать сумку|fight:beetle:2:herbalist',
 'Взять рецептурные записи для последующей встречи|item:herbal_recipe:1',
 'Оставить человека в укрытии|leave']);
rewrite(7,'Последний приказ рыцаря','Мёртвый рыцарь загораживает телом проход к маленькой часовне. Его медная печать всё ещё зажата в пальцах.',[
 'Забрать печать и доставить лесничим|item:knight_emblem:1;flag:knight_vow',
 'Собрать пригодные части доспеха|material:Стальные обломки:3;item:armor_plate:1',
 'Почтить погибшего и взять походную аптечку|item:healing_salve:2',
 'Оставить тело нетронутым|leave']);
rewrite(8,'Кострище пропавшего каравана','Ещё теплится походный огонь. Люди бежали в спешке: рядом лежат запечатанные котелки и список пропавших охотников.',[
 'Приготовить дорожную еду|item:ration:2;flag:camp_cooked',
 'Разобрать следы повозок|flag:caravan_tracks;item:cart_token:1',
 'Собрать из сухого дерева укрытие|buff:shelter:3:10;item:firewood:1',
 'Покинуть привал|leave']);
rewrite(9,'Пчелиное царство','Большой улей занимает дупло. Внутри живёт редкая матка; пчёлы пропускают только осторожного собирателя.',[
 'Использовать дымарь и собрать соты|take:smoker:1;item:honey:3|item:smoker:1',
 'Установить дымный костёр из сухих дров|take:firewood:1;item:honey:2|item:firewood:1',
 'Найти цветы вокруг улья|item:nectar:2;flag:bee_friendly',
 'Оставить улей нетронутым|leave']);
rewrite(10,'Логово волчьей стаи','В грязи видны три следа. Один принадлежит огромному волку, остальные — хромому взрослому и детёнышу.',[
 'Изучить направление стаи|flag:wolf_tracks;item:wolf_scent:1',
 'Поймать разведчика и найти метку вожака|fight:wolf:1:tracks',
 'Оставить приманку для наблюдения|item:wolf_bait:1;flag:wolf_tracks',
 'Пойти другой дорогой|leave']);
rewrite(11,'Жетон старшего лесничего','Под охотничьим плащом скелета сохранился номерной знак. Его изображение повторяется на дверях лесных складов.',[
 'Забрать жетон для сторожевых постов|item:ranger_badge:1;flag:ranger_badge',
 'Отправить послание стражам с местом находки|flag:ranger_message;item:wardens_note:1',
 'Снять ещё пригодные охотничьи детали|material:Кожа лесника:2',
 'Не тревожить останки|leave']);
rewrite(12,'Тропа старых ловчих','На деревьях вырезаны знаки охотников. По обрывку карты можно найти тайный пункт хранения оружия.',[
 'Сверить карту и получить ключ от оружейного тайника|take:map_scrap:1;flag:trail_mapped;item:cache_key:1|item:map_scrap:1',
 'Проверить сторожевые силки|item:stun_trap:1;item:snare_wire:1',
 'Разобрать сломанные знаки и забрать материалы|material:Кожа лесника:2',
 'Отложить исследование|leave']);
rewrite(13,'Ворон-меняла','Чёрный ворон держит в клюве серебряную подвеску. Он явно умеет обмениваться вещами и запоминает друзей.',[
 'Обменять мёд на воронье перо|take:honey:1;item:raven_feather:1|item:honey:1',
 'Угостить нектаром и получить ключик|take:nectar:1;item:raven_key:1;flag:raven_friend|item:nectar:1',
 'Проверить спрятанное под жердью гнездо|material:Старые монеты:2;item:owl_feather:1',
 'Уйти|leave']);
rewrite(14,'Топор пропавшего лесоруба','У разбитой телеги лежит стальной топор с тёмно-зелёной рукоятью. На лезвии — следы необычной смолы.',[
 'Забрать многоразовый топор|item:axe:1',
 'Снять крепёж и обмотку|item:repair_straps:2',
 'Отметить место для найденного лесоруба|flag:woodcutter_cart',
 'Оставить инструмент|leave']);
rewrite(15,'Родник под корнями','Чистый родник течёт через сеть светящихся корней. Вода снимает яд и необходима для лечения больного древа.',[
 'Набрать две склянки родниковой воды|item:water:2',
 'Очистить сосуд и заготовить лечебную основу|item:herbal_extract:2;flag:spring_cleaned',
 'Омыть раны и избавиться от отравления|heal:22;status:clean',
 'Не трогать источник|leave']);
rewrite(16,'Лисья благодарность','В корнях старой осины обустроено тайное логово. Чёрнолапая лисица узнаёт того, кто помог ей.',[
 'Принять плащ, спрятанный в лисьем тайнике|unique:fox_cloak;flag:fox_friend|flag:fox_freed',
 'Отправиться за лисицей к целебным растениям|item:forest_moss:3;item:fox_scent:1|flag:fox_contact',
 'Исследовать заброшенный силок|item:snare_wire:2;item:bleed_trap:1',
 'Вернуться позже|leave']);
rewrite(17,'Разрушенная дорога к складу','Поваленные стволы заблокировали лесную дорогу. За ними слышен скрип старых телег с припасами.',[
 'Расчистить многоразовым топором|flag:road_cleared;item:supply_crate:2|item:axe:1',
 'Восстановить проезд стяжными ремнями|take:repair_straps:2;flag:road_cleared;item:supply_crate:1|item:repair_straps:2',
 'Обойти завал и найти тропу браконьеров|flag:poacher_tracks;item:snare_wire:1',
 'Вернуться после подготовки|leave']);
rewrite(18,'Верёвочный пост у оврага','На сухой сосне висит сложенный верёвочный мостик. Узел не распускается без правильного движения.',[
 'Освободить верёвку и собрать мостовой комплект|item:rope:1;item:bridge_hooks:1',
 'Снять страховочную петлю|item:rope:1',
 'Сохранить снаряжение для дозорного поста|flag:bridge_learned;item:repair_straps:2',
 'Оставить на месте|leave']);
rewrite(19,'Смотровая вышка старшей стражи','С вышки можно заметить обходную дорогу к лагерю браконьеров. В запертом шкафу лежит охотничье снаряжение.',[
 'Открыть шкаф жетоном лесничего|unique:ranger_boots;flag:watchtower|item:ranger_badge:1',
 'Восстановить сигнальный огонь|take:firewood:1;flag:watchtower_lit;item:wardens_note:1|item:firewood:1',
 'Снять прицел с дозорного арбалета|item:scope_lens:1',
 'Не подниматься|leave']);
rewrite(20,'Последнее письмо дозорного','Под корой старого дуба спрятано письмо. Дозорный предупреждает: в поселении лесничих есть предатель.',[
 'Сохранить письмо для начальника поста|item:guard_letter:1;flag:guard_letter',
 'Переписать имена сообщников браконьеров|item:poacher_names:1;flag:poacher_leads',
 'Взять запас бинтов из сумки дозорного|item:healing_salve:2',
 'Оставить всё как есть|leave']);
rewrite(21,'Совиное святилище','Древняя сова сторожит небольшую статую. Её глаза вспыхивают, если кто-то приносит дар или знает язык птиц.',[
 'Поднести воронье перо, получить особый знак|take:raven_feather:1;unique:owl_charm|item:raven_feather:1',
 'Принести две порции нектара|take:nectar:2;item:owl_feather:2|item:nectar:2',
 'Попросить защиту от охотничьих ловушек|item:owl_feather:1;buff:trapward:5:35',
 'Покинуть святилище|leave']);
rewrite(22,'Медовый горшок караванщика','На пне остался запечатанный горшок. Пчёлы роятся вокруг, но разорённый караван уже не вернётся.',[
 'Разделить мёд на несколько лечебных порций|item:honey:2',
 'Приготовить походный паёк|take:firewood:1;item:ration:2|item:firewood:1',
 'Использовать мёд для звериной приманки|item:wolf_bait:1;item:boar_lure:1',
 'Не трогать горшок|leave']);
rewrite(23,'Грибы под лунной шляпкой','Вокруг упавшего дерева выросли грибы двух видов. Знакомые травнику — лекарственные, чёрные — подходят для ловушек.',[
 'Собрать целебные грибы|item:mushroom:2;item:forest_moss:1',
 'Изготовить споровую ловушку|item:spore:2;item:stun_trap:1',
 'Сверить рецепт спасённого травника|item:healing_salve:3;item:herbal_extract:1|flag:herbalist_saved',
 'Оставить грибницу нетронутой|leave']);
rewrite(24,'Оружейный тайник лесничих','Под мхом скрывается сундук, а замок открыт лишь номерным ключом и охотничьим жетоном.',[
 'Открыть ключом с тайной тропы|take:cache_key:1;unique:ranger_bow|item:cache_key:1',
 'Предъявить жетон лесничего|unique:ranger_bow|item:ranger_badge:1',
 'Снять ловушку с замка и взять полезные детали|item:bleed_trap:1;item:snare_wire:2',
 'Оставить тайник закрытым|leave']);
rewrite(25,'След огромного альфа-волка','Огромные лапы вожака оставили отпечатки на свежей земле. Для трофея бестиария вожака нужно победить.',[
 'Вызвать альфа-волка на охоту|hunt:wolf|flag:wolf_tracks',
 'Обмануть стаю с помощью спасённого волчонка|item:wolf_bait:2;flag:wolf_alpha_lair|flag:wolf_cub',
 'Забрать следовой мускус|item:wolf_scent:2;flag:wolf_tracks',
 'Отложить охоту|leave']);
rewrite(26,'Барсук и старый клад','Барсук натаскал в нору пропавшие колья и сумки путников. Некоторые до сих пор снабжены стражевыми печатями.',[
 'Приманить барсука пищей и забрать вещи|take:ration:1;gold:45;item:repair_straps:2|item:ration:1',
 'Сразиться с разъярённым барсуком|fight:badger:1:burrow',
 'Снять безопасно расположенный силок|item:stun_trap:1',
 'Оставить нору|leave']);
rewrite(27,'Волчонок с раненной лапой','В густых зарослях скулит волчонок. На шее затянулся шнур браконьеров. Спасённый детёныш сможет повлиять на стаю.',[
 'Перевязать с помощью лечебной мази|take:healing_salve:1;flag:wolf_cub;item:pack_whistle:1|item:healing_salve:1',
 'Распутать силок вручную|flag:wolf_cub;item:snare_wire:1',
 'Снять исправный капкан, не приближаясь|item:bleed_trap:1',
 'Оставить зверя|leave']);
rewrite(28,'Разрытая тропа великого секача','Гигантский секач опрокинул караван. По направлению борозд можно найти логово и схрон торговца.',[
 'Снять следы и подготовить приманку|flag:boar_tracks;item:boar_lure:1',
 'Отбить разграбленное повозочное колесо|fight:boar:2:boar_path',
 'Собрать разбросанные походные инструменты|item:repair_straps:2;item:supply_crate:1',
 'Продолжить путь|leave']);
rewrite(29,'Вызов великого секача','На охотничьем камне вырезан силуэт огромного кабана. Зазубрины на нём оставлены клыками прежних вожаков.',[
 'Призвать великого секача|hunt:boar|flag:boar_tracks',
 'Подготовить приманку для следующей встречи|take:boar_lure:1;item:stun_trap:2|item:boar_lure:1',
 'Исследовать тропу секача|item:boar_lure:1;material:Кабаний клык:2',
 'Отложить охоту|leave']);
rewrite(30,'Стон древнего дуба','Огромный дуб разговаривает скрипом корней. Под его корой растёт заражённая грибница, истощающая сердце леса.',[
 'Выслушать историю и взять печатную руну|flag:oak_voice;item:oak_rune:1',
 'Собрать живую смолу для лекарства|item:oak_resin:2;flag:oak_voice',
 'Обработать заражённую кору целебной мазью|take:healing_salve:1;flag:oak_voice;item:oak_rune:1|item:healing_salve:1',
 'Оставить древ в покое|leave']);
rewrite(31,'Клетка браконьеров','В тесной клетке лежит раненая рысь. На деревьях вокруг расставлены ржавые силки и охранные растяжки.',[
 'Освободить рысь и взять метку охотников|flag:poacher_freed;item:poacher_names:1',
 'Обезвредить сигнальные растяжки|flag:poacher_alarm_cut;item:stun_trap:2',
 'Забрать инструменты браконьеров|item:smoker:1;item:snare_wire:2',
 'Вернуться с помощью|leave']);
rewrite(32,'Пугало с часовыми колокольцами','На пугале висят десятки маленьких сигнальных колоколов. Под травой спрятана длинная нить, ведущая в лагерь браконьеров.',[
 'Перерезать сигнальную растяжку|flag:poacher_alarm_cut;item:snare_wire:2',
 'Восстановить сигнальный механизм для себя|item:alarm_bell:2',
 'Проследить натянутую нить к лагерю|flag:poacher_leads;item:poacher_names:1',
 'Оставить конструкцию|leave']);
rewrite(33,'Живая лоза хранительницы','Из земли поднимаются длинные шипастые плети. Они не нападают, пока герой не приближается к молодым корням.',[
 'Подвязать сломанные корни|take:water:1;flag:vine_helped;item:living_seed:1|item:water:1',
 'Очистить ветви от грибковых спор|take:herbal_extract:1;flag:vine_helped;item:oak_resin:2|item:herbal_extract:1',
 'Аккуратно собрать лечебную кору|item:forest_moss:2',
 'Оставить лозу|leave']);
rewrite(34,'Привал следопыта Аэлина','Следопыт Аэлин предлагает помочь с охотой, но сначала хочет удостовериться, что герой не связан с браконьерами.',[
 'Показать найденные у браконьеров имена|flag:tracker_ally;item:healing_salve:2|item:poacher_names:1',
 'Показать спасённого волчонка|flag:tracker_ally;item:pack_whistle:1|flag:wolf_cub',
 'Обменять провизию на разведывательный порох|take:ration:1;item:scout_powder:2|item:ration:1',
 'Вернуться позднее|leave']);
rewrite(35,'Пост дальнего дозора','В сторожевом здании осталось несколько лесничих. Комендант ждёт письмо пропавшего дозорного и доказательства предательства.',[
 'Передать последнее письмо и получить нагрудник дозора|take:guard_letter:1;flag:guard_reported;unique:warden_armor|item:guard_letter:1',
 'Передать список браконьеров и открыть боевой склад|take:poacher_names:1;flag:guard_reported;item:cache_key:1;item:stun_trap:2|item:poacher_names:1',
 'Восстановить сигнальный пост и получить припасы|take:repair_straps:2;flag:watchtower_lit;item:supply_crate:2|item:repair_straps:2',
 'Вернуться с доказательствами|leave'],'');
rewrite(36,'Закрытый сундук лесничего','На сундуке знак старшего дозорного. Замок отвечает на металлический жетон и на воронью печать.',[
 'Открыть жетоном лесничего|unique:warden_ring;gold:50|item:ranger_badge:1',
 'Открыть вороньим ключом|take:raven_key:1;unique:warden_ring|item:raven_key:1',
 'Разобрать внешний корпус|item:supply_crate:2;material:Кожа лесника:2',
 'Оставить тайник|leave'],'');
rewrite(37,'Следы матки панцирников','Под гнилыми листьями трескаются хитиновые оболочки. Под курганом растёт огромная жучиная матка.',[
 'Вызвать матку панцирников|hunt:beetle',
 'Собрать пластины из сброшенных панцирей|material:Хитиновая пластина:4',
 'Сжечь заражённые коконы|take:firewood:1;flag:beetle_burned;item:herbal_extract:2|item:firewood:1',
 'Отложить охоту|leave']);
rewrite(38,'Порченое гнездо грибницы','Серо-зелёные коконы шевелятся. Грибница использует останки зверей, чтобы выращивать новых хищных жуков.',[
 'Очистить коконы боем|fight:beetle:2:cocoon',
 'Собрать заражённые споры для лекарства|item:spore:2;item:fungal_sample:1',
 'Сжечь колонию подготовленным огнём|take:firewood:1;flag:fungal_weakened;item:herbal_extract:2|item:firewood:1',
 'Оставить курган|leave']);
rewrite(39,'Корневой страж древней рощи','За живой дверью ждёт огромный корневой страж. Он считает каждого приближающегося чужаком.',[
 'Вызвать стража на поединок|hunt:root|flag:oak_voice',
 'Предъявить знак восстановленной печати|item:oak_resin:2;flag:root_allied|flag:grove_seal',
 'Попросить у стража древесный оберег|take:living_seed:1;item:oak_resin:2|item:living_seed:1',
 'Оставить древо в покое|leave']);
rewrite(40,'Старая печать рощи','Менгир испещрён трещинами. Печать сдерживает грибковую болезнь, но камень можно восстановить только руной дуба.',[
 'Установить руну дуба и восстановить печать|take:oak_rune:1;flag:grove_seal;home:forest_shrine|item:oak_rune:1',
 'Укрепить трещины живой смолой|take:oak_resin:2;flag:grove_seal;item:tree_bark:1|item:oak_resin:2',
 'Забрать заражённый фрагмент для исследования|item:fungal_sample:1;item:forest_moss:2',
 'Покинуть менгир|leave']);
rewrite(41,'Лунная тропа охотников','Ветки образуют коридор, освещённый ровным лунным светом. В нишах хранятся забытые ритуальные плащи.',[
 'Сплести лунный плащ с помощью совиного пера|take:owl_feather:1;unique:moon_mantle|item:owl_feather:1',
 'Собрать лунную росу|item:lunar_dew:2',
 'Призвать лесной свет и защитить следующие этажи|buff:shelter:3:15;item:firewood:1',
 'Не нарушать тишину|leave']);
rewrite(42,'Заброшенный мост следопытов','Переправа оборвалась во время бегства дозорного. На противоположном берегу видна запертая оружейная телега.',[
 'Закрепить мост верёвкой и крюками|take:rope:1;take:bridge_hooks:1;unique:ranger_boots;item:supply_crate:2|item:rope:1',
 'Использовать только верёвку для доставки припасов|take:rope:1;item:supply_crate:3|item:rope:1',
 'Изучить опоры и сохранить схему строительства|flag:bridge_learned;item:repair_straps:2',
 'Покинуть мост|leave']);
rewrite(43,'Камень забытых следопытов','На памятном камне перечислены имена погибших лесничих. Один из них оставил схему прохода к сердцу леса.',[
 'Сверить схему с картой лесничего|flag:forgotten_trail;item:forest_compass:1|flag:map_first',
 'Вернуть печать погибшего рыцаря|take:knight_emblem:1;unique:warden_armor;flag:knight_restored|item:knight_emblem:1',
 'Вынуть древний лесной гвоздь и починить снаряжение|item:repair_straps:3;item:armor_plate:1',
 'Уйти|leave']);
rewrite(44,'Камень охотничьей клятвы','Древняя статуя предлагает две несовместимые клятвы: защищать слабых либо уничтожать угрозу до её нападения.',[
 'Клятва защитника: щит при входе на 5 этажей|buff:shelter:5:20;flag:protector_oath',
 'Клятва следопыта: первые пять боевых ударов усилены|buff:hunt:5:20;flag:hunter_oath',
 'Не принимать клятву, а взять защитный символ|item:forest_moss:2;item:alarm_bell:1',
 'Уйти|leave']);
rewrite(45,'Больной молодой древ','Молодое дерево мучается под чёрной корой. Древняя печать рощи может остановить болезнь, но потребуется очистить корни.',[
 'Исцелить древа, используя восстановленную печать|flag:young_treant_healed;trophy:grove;item:tree_bark:2|flag:grove_seal',
 'Очистить грибницу целебной водой|take:water:1;flag:young_treant_healed;item:living_seed:1|item:water:1',
 'Собрать заражённую кору для исследования|item:fungal_sample:2',
 'Вернуться с лекарством|leave'],'flag:grove_seal');
rewrite(46,'Хижина травницы Мары','Мара собирает редкие листья и готовит настои. Она также умеет шить снаряжение для долгих лесных походов.',[
 'Сшить сумку травницы|take:repair_straps:2;take:forest_moss:2;unique:forager_bag|item:repair_straps:2',
 'Обменять мёд на лекарства|take:honey:1;item:healing_salve:3|item:honey:1',
 'Изготовить защиту от лесных ядов|take:fungal_sample:1;item:antivenom:2|item:fungal_sample:1',
 'Оставить хижину|leave']);
rewrite(47,'Лесной огонь духов','На пепелище вспыхивают добрые холодные огни. Они ищут того, кто может донести их до заражённой сердцевины дуба.',[
 'Сохранить огонёк в амулете|take:lunar_dew:1;unique:forest_lantern|item:lunar_dew:1',
 'Попросить огни очистить найденную воду|take:water:1;item:antivenom:2|item:water:1',
 'Предложить живой желудь|take:acorn:1;item:living_seed:2;flag:spirits_friendly|item:acorn:1',
 'Отойти от пепелища|leave']);
rewrite(48,'Сердце заражённой грибницы','Под корнями пульсирует огромная сеть грибных нитей. Она готова поднять мёртвых зверей, если её не остановить.',[
 'Уничтожить заражённые наросты в бою|fight:spore:3:fungal',
 'Очистить грибницу родниковой водой и экстрактом|take:water:1;take:herbal_extract:1;flag:fungus_purified;item:fungus_essence:2|item:water:1',
 'Забрать яд для создания мощных ловушек|item:spore:3;item:fungal_sample:2',
 'Уйти|leave']);
rewrite(49,'Камень Врат Земли','В корнях каменной арки вырезан символ Врат Земли. Кратчайший путь сквозь лес существовал задолго до первых охотников.',[
 'Скопировать уникальный свиток Врат Земли|earthgate;flag:earthgate_studied',
 'Сверить символы с лесным компасом|take:forest_compass:1;item:waymark:2;item:ranger_flare:1|item:forest_compass:1',
 'Собрать остаточную магию для запасов|item:lunar_dew:2;item:oak_resin:1',
 'Оставить арку|leave']);
rewrite(50,'Сердце древнего дуба','Древнее сердце рощи открылось лишь тому, кто спас молодого древа. Дух предлагает одно из трёх наследий, которые определят судьбу леса.',[
 'Принять Сердце дубравы — уникальный амулет|unique:oak_amulet;flag:grove_heart',
 'Оставить сердце лесу и передать семя в деревню|home:grove_seed;flag:grove_heart;item:living_seed:1',
 'Стать защитником рощи и получить благословение до конца похода|stat:hp:15;stat:def:2;buff:shelter:4:18;flag:grove_heart',
 'Вернуться к сердцу позже|leave'],'flag:young_treant_healed');

/* Named one-off rescues and oaths cannot be farmed as ordinary encounters. */
FE.scene(6).repeat=false;
FE.scene(44).repeat=false;
/* Approved art remains attached to the original scene IDs. Every item has visible inventory art. */
var extraItems={
 snare_wire:['Проволока силка','F02_010'],healing_salve:['Лечебная мазь','F02_043'],
 herbal_recipe:['Рецепт травника','F02_052'],ration:['Походный паёк','F02_018'],
 cart_token:['Жетон каравана','F02_004'],firewood:['Сухие дрова','F01_011'],waymark:['Путевая отметка','F02_003'],
 nectar:['Цветочный нектар','F02_031'],fox_scent:['Метка чёрнолапой лисицы','F02_025'],
 knight_emblem:['Печать павшего рыцаря','F02_006'],armor_plate:['Накладка для доспеха','F02_011'],
 wardens_note:['Записка лесничего','F02_062'],cache_key:['Ключ охотничьего тайника','F02_006'],
 repair_straps:['Крепёжные ремни','F02_055'],bridge_hooks:['Мостовые крюки','F02_055'],
 raven_feather:['Перо чёрного ворона','F02_040'],raven_key:['Вороньий ключ','F02_006'],
 wolf_scent:['Метка волчьей стаи','F02_034'],wolf_bait:['Приманка для волка','F02_031'],
 wolf_cub_token:['Знак спасённого волчонка','F02_049'],pack_whistle:['Свисток стаи','F02_049'],
 boar_lure:['Приманка для секача','F02_031'],forest_moss:['Лечебный лесной мох','F02_043'],
 herbal_extract:['Травяной экстракт','F02_051'],poacher_names:['Список браконьеров','F02_062'],
 alarm_bell:['Сигнальный колокольчик','F02_004'],scope_lens:['Оптическая линза','F02_003'],
 scout_powder:['Разведывательный порошок','F02_034'],oak_resin:['Живая смола дуба','F02_040'],
 living_seed:['Живое семя','F02_049'],tree_bark:['Кора живого древа','F02_040'],
 fungal_sample:['Образец грибницы','F02_043'],fungus_essence:['Эссенция грибницы','F02_043'],
 forest_compass:['Компас лесничего','F02_003'],lunar_dew:['Лунная роса','F02_051'],
 antivenom:['Антидот травницы','F02_051'],ranger_flare:['Сигнальная ракета','F02_034'],
 supply_crate:['Пакет караванных припасов','F02_018'],acorn:['Желудь','F02_049'],
 owl_feather:['Перо лесной совы','F02_040']
};
Object.keys(extraItems).forEach(function(k){FE.itemDefs[k]=extraItems[k];});
var unique={
 fox_cloak:{name:'Плащ чернолапой лисицы',slot:'cloak',def:0,hp:5,dodge:7,trapReduce:15,trait:'+7% уклонения и −15% урона от ловушек'},
 ranger_boots:{name:'Сапоги лесного дозора',slot:'boots',def:1,hp:7,dodge:5,trait:'+5% уклонения, +7 HP'},
 ranger_bow:{name:'Лук старшего лесничего',slot:'weapon',atk:6,crit:4,trait:'Охотничий лук: +4% шанса крита'},
 owl_charm:{name:'Глаз лесной совы',slot:'amulet',pow:3,crit:3,trait:'Магическая защита охотничьего святилища'},
 warden_armor:{name:'Кираса лесного дозора',slot:'armor',def:3,hp:18,shieldFloor:8,trait:'+8 щита при входе на новый этаж'},
 warden_ring:{name:'Перстень старшего дозорного',slot:'ring',atk:2,crit:5,trait:'+5% критического шанса'},
 moon_mantle:{name:'Лунный плащ друида',slot:'cloak',def:2,mp:10,pow:2,trait:'Облегчает использование магии'},
 forager_bag:{name:'Сумка травницы',slot:'armor',def:-1,hp:16,forage:1,trait:'Дополнительные припасы при сборе растений'},
 forest_lantern:{name:'Огонёк рощи',slot:'amulet',pow:3,shieldFloor:10,trait:'+10 щита на каждом этаже'},
 oak_amulet:{name:'Сердце дубравы',slot:'amulet',hp:25,def:2,killHeal:4,trait:'+4 HP за убийство врага'}
};
var useNames={
 healing_salve:'Лечебная мазь: +32 HP и снятие кровотечения',
 ration:'Походный паёк: +20 HP и +12 маны',
 forest_moss:'Лесной мох: +16 HP и снятие яда',
 antivenom:'Антидот: полное снятие яда и кровотечения',
 ranger_flare:'Сигнальная ракета: оглушение видимых обычных врагов на один ход',
 pack_whistle:'Свисток стаи: замедление хода видимых врагов на 2 шага',
 alarm_bell:'Колокольчик: +20 щита, следующие три хода',
 scout_powder:'Разведывательный порошок: на следующем этаже отметить вражеские и опасные плиты',
 supply_crate:'Караванные припасы: +1 лечебный эликсир и +1 походный паёк',
 lunar_dew:'Лунная роса: +25 MP',
 tree_bark:'Кора живого древа: +25 щита',
 fungus_essence:'Эссенция грибницы: +15 HP и +15 MP'
};
function extra(run){var f=FE.ensure(run);if(!f.storyV2)f.storyV2={unique:{},home:{},buffs:[],uses:{},hintCharges:0};return f.storyV2;}
function equipped(run,k){
 if(!run||!run.equip)return 0;
 return Object.keys(run.equip).reduce(function(v,slot){
  var id=run.equip[slot],it=(run.items||[]).find(function(x){return x.id===id;});
  return v+(it&&unique[it.forestUnique]&&unique[it.forestUnique][k]||0);
 },0);
}
function getBonus(run,k){return equipped(run,k);}
function grantUnique(run,id,api){
 var x=extra(run),o=unique[id];if(!o)return 'Предмет не найден';
 if(x.unique[id]||(run.items||[]).some(function(it){return it.forestUnique===id;}))return 'Уникальная экипировка уже найдена';
 var it=api.addItem(o.slot,4);if(!it)return 'Не удалось выдать снаряжение';
 it.name=o.name;it.setId=null;it.setName=null;it.rarity=4;it.forestUnique=id;it.trait=o.trait;
 for(var stat of ['atk','def','hp','mp','pow','crit'])it[stat]=o[stat]||0;
 x.unique[id]=true;return 'Получен уникальный предмет: '+o.name;
}
function applyEffect(run,op,api){
 var p=op.split(':'),x=extra(run),value=Number(p[2]||1);
 if(p[0]==='unique')return grantUnique(run,p[1],api);
 if(p[0]==='home'){x.home[p[1]]=true;return 'Получен лесной проект для поселения: '+p[1];}
 if(p[0]==='buff'){x.buffs.push({kind:p[1],left:Math.max(1,value),value:Number(p[3]||10)});return 'Открыто временное усиление: '+p[1]+' на '+value+' применений';}
 return null;
}
function homeReturn(run,meta){
 var x=extra(run),home=meta.forestProjects||(meta.forestProjects={}),arr=[];
 Object.keys(x.home).forEach(function(id){if(x.home[id]&&!home[id]){home[id]=true;arr.push(id);}delete x.home[id];});
 return arr;
}
function forage(run,material){
 var x=extra(run),bonus=equipped(run,'forage');if(!bonus)return 0;
 var key=material||'Лекарственный мох';
 run.materials[key]=(run.materials[key]||0)+bonus;return bonus;
}
function onFloor(run,meta){
 if(!run||run.actIndex!==0||run.locationIndex!==0)return '';
 var x=extra(run),messages=[];
 var shield=equipped(run,'shieldFloor');
 if(meta&&meta.forestProjects&&meta.forestProjects.forest_shrine)shield+=5;
 if(shield){run.shield=(run.shield||0)+shield;messages.push('Обереги рощи: +'+shield+' щита');}
 if(meta&&meta.forestProjects&&meta.forestProjects.grove_seed){
  var cap=arguments[2]&&arguments[2].hp||run.hp+3;run.hp=Math.min(cap,run.hp+3);
  messages.push('Деревенский саженец восстанавливает до 3 HP');
 }
 for(var b of x.buffs){
  if(b.left>0&&b.kind==='shelter'){run.shield=(run.shield||0)+b.value;b.left--;messages.push('Укрытие: +'+b.value+' щита');}
 }
 x.buffs=x.buffs.filter(function(b){return b.left>0;});
 if(x.hintCharges>0){
  x.hintCharges--;
  (run.tiles||[]).forEach(function(t){if(!t.revealed&&(t.kind==='enemy'||t.kind==='trap'))t.forestHintDanger=true;});
  messages.push('Опасные плиты отмечены на этом этаже');
 }
 return messages.join(' · ');
}
function firstStrikeBonus(run){var x=extra(run),b=x.buffs.find(function(y){return y.kind==='hunt'&&y.left>0;});
 if(!b)return 0;b.left--;x.buffs=x.buffs.filter(function(y){return y.left>0;});return b.value;}
function trapBonus(run){var x=extra(run),b=x.buffs.find(function(y){return y.kind==='trapward'&&y.left>0;});
 if(!b)return 0;b.left--;x.buffs=x.buffs.filter(function(y){return y.left>0;});return b.value;}
function use(run,id,api){
 var f=FE.ensure(run),x=extra(run);if(!useNames[id]||!f.items[id])return {ok:false,message:'Предмет отсутствует'};
 if(id==='healing_salve'){run.hp=Math.min(api.stats().hp,run.hp+32);run.bleedTurns=0;}
 else if(id==='ration'){run.hp=Math.min(api.stats().hp,run.hp+20);run.mp=Math.min(api.stats().mp,run.mp+12);}
 else if(id==='forest_moss'){run.hp=Math.min(api.stats().hp,run.hp+16);run.poisonTurns=0;}
 else if(id==='antivenom'){run.poisonTurns=0;run.bleedTurns=0;}
 else if(id==='ranger_flare'){(run.tiles||[]).forEach(function(t){if(t.foe&&t.revealed&&!t.foe.boss&&t.foe.hp>0)t.foe.stun=Math.max(1,t.foe.stun||0);});}
 else if(id==='pack_whistle'){(run.tiles||[]).forEach(function(t){if(t.foe&&t.revealed&&t.foe.hp>0)t.foe.attackCooldown=(t.foe.attackCooldown||t.foe.cooldown||2)+2;});}
 else if(id==='alarm_bell')run.shield=(run.shield||0)+20;
 else if(id==='scout_powder')x.hintCharges++;
 else if(id==='supply_crate'){run.potions=(run.potions||0)+1;f.items.ration=(f.items.ration||0)+1;}
 else if(id==='lunar_dew')run.mp=Math.min(api.stats().mp,run.mp+25);
 else if(id==='tree_bark')run.shield=(run.shield||0)+25;
 else if(id==='fungus_essence'){run.hp=Math.min(api.stats().hp,run.hp+15);run.mp=Math.min(api.stats().mp,run.mp+15);}
 f.items[id]--;if(!f.items[id])delete f.items[id];
 return {ok:true,turn:true,message:(FE.itemDefs[id]||[id])[0]+': '+useNames[id]};
}
/* Entry points remain tied to their floors until the player resolves the quest. */
var MILESTONES={3:5,6:11,10:20,14:30,18:31};
function milestone(run,candidates){
 if(!run||run.actIndex!==0||run.locationIndex!==0)return null;
 var id=MILESTONES[run.floor],f=FE.ensure(run);
 if(id&&!f.seen[id]&&(candidates||[]).some(function(s){return s.id===id;}))return id;
 return null;
}
function priority(run,candidates){
 var f=FE.ensure(run),steps=[
  ['fox_freed',16],['map_first',12],['ranger_badge',19],['caravan_tracks',17],
  ['guard_letter',35],['poacher_freed',34],['wolf_cub',25],
  ['oak_voice',40],['grove_seal',45],['young_treant_healed',50],['fungus_purified',50],
  ['herbalist_saved',23],['trail_mapped',24],['forgotten_trail',49]
 ];
 for(var pair of steps){
  if(f.flags[pair[0]]&&candidates.some(function(s){return s.id===pair[1];})&&!f.seen[pair[1]])return pair[1];
 }
 return null;
}
function nextQuest(run){
 var f=FE.ensure(run),list=FE.scenes.filter(function(z){return run.floor>=z.min&&!f.seen[z.id]&&(!z.need||FE.has(run,z.need));});
 return milestone(run,list)||priority(run,list);
}
function itemUsedDescription(id){return useNames[id]||null;}
window.CryptForestRework={unique:unique,useNames:useNames,extra:extra,bonus:getBonus,apply:applyEffect,
 homeReturn:homeReturn,forage:forage,onFloor:onFloor,firstStrikeBonus:firstStrikeBonus,trapBonus:trapBonus,
 use:use,milestone:milestone,priority:priority,nextQuest:nextQuest,itemUsedDescription:itemUsedDescription};
})();