// Handoff documentation content — structured data for developer handoff page

export interface HandoffComponent {
  id: string;
  name: string;
  purpose: string;
  logic: string;
  dataSource: string;
}

export interface HandoffSection {
  id: string;
  title: string;
  description: string;
  components: HandoffComponent[];
}

export const handoffSections: HandoffSection[] = [
  /* ───────────────────── 1. Dashboard ───────────────────── */
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Главный экран — обзор ключевых метрик, воронка контента и управление AI-агентом.',
    components: [
      {
        id: 'roas-card',
        name: 'ROAS Card',
        purpose: 'Показываем клиенту: вот ты потратил на Tely $X/мес — а он принёс тебе pipeline на $Y. Стоимость подписки растёт со временем (1mo ≈ $700, 12mo ≈ $8K), но pipeline растёт быстрее. Это главный аргумент ценности продукта.',
        logic: `ROAS = Pipeline Value / Subscription Cost
• Pipeline Value = (Identified Visitors + Contacted) × Deal Size
• Subscription Cost — стоимость подписки Tely (зависит от тарифа, растёт со временем)
• Визуализация: горизонтальный ratio bar (синий = pipeline, серый = cost)`,
        dataSource: `• Identified Visitors → RB2B (де-анонимизация посетителей сайта)
• Deal Size → настраиваемое поле на уровне аккаунта (default $500)
• Subscription Cost → биллинг Tely (стоимость подписки клиента)`,
      },
      {
        id: 'organic-leads-card',
        name: 'Organic Leads Card',
        purpose: 'Мы не visibility tool и не traffic tool — это основная причина, по которой от нас отписываются: люди не понимают ценность. Мы должны чётко показывать, что Tely — это штука, которая приносит компании лидов. Поэтому Organic Leads — центральная метрика.',
        logic: `Три сегмента:
• Identified — посетители, идентифицированные через RB2B
• Contacted — те, с кем AI sales agent вступил в контакт
• Captured — те, кто оставил финальный контакт при общении с sales agent
Визуализация: stacked bar (cyan оттенки) + легенда с числами`,
        dataSource: `• Identified Visitors → RB2B (де-анонимизация по IP/cookie)
• Contacted Leads → AI Sales Agent (статус "agent отправил сообщение")
• Captured Leads → AI Sales Agent (лид ответил и оставил контакт)`,
      },
      {
        id: 'pipeline-value-card',
        name: 'Pipeline Value Card',
        purpose: 'Та же логика, что ROAS — перемножаем лидов на deal size. Deal size — настраиваемое поле на уровне аккаунта с дефолтным значением, которое человек может редактировать, чтобы видеть +/- актуальную информацию.',
        logic: `Pipeline Value = (Identified Visitors + Contacted Leads) × Deal Size
• Deal Size — настраиваемое поле на уровне аккаунта
• Пресеты: $500, $1K, $5K, $10K, $50K + custom input
• При изменении deal size мгновенно пересчитывается pipeline`,
        dataSource: `• Lead Count → RB2B (identified) + AI Sales Agent (contacted)
• Deal Size → настройка аккаунта (поле в профиле клиента)`,
      },
      {
        id: 'maturity-stage-switcher',
        name: 'MaturityStageSwitcher',
        purpose: 'Демо-переключатель стадии зрелости клиента (только для прототипа).',
        logic: `6 стадий: 1mo → 3mo → 6mo → 9mo → 12mo → 18mo
Каждая стадия масштабирует все метрики через множители (0%–100%).
• 1mo–6mo: цель = Organic Traffic Growth
• 9mo–18mo: цель = Lead Generation
Переключение мгновенно пересчитывает весь дашборд.`,
        dataSource: `• В продакшене: стадия определяется автоматически по дате начала подписки клиента
• В прототипе: ручное переключение для демо`,
      },
      {
        id: 'agent-mission-control',
        name: 'AgentMissionControl',
        purpose: 'У нас есть компании, которым мы опубликовали 1000+ статей. Они постоянно спрашивают: что нужно удалять? какой контент апдейтить? что меняется? Сейчас менеджер делает это руками — это очень сложно. Логика: всей этой работой должна заниматься система автоматически.',
        logic: `Привязана к обновлённому topical cluster. 4 состояния кластера:
• Publish & Monitor — новый кластер, публикуем и наблюдаем
• Scale Production — хорошо перформящий кластер, находим новые keywords, публикуем новый контент
• Update Content — кластер упал (например после апдейта Google, трафик обвалился) → нужно переписывать/обновлять
• Delete & Merge — контент не перформит, не расходовать crawl budget → удалять и мержить
Лента последних действий агента (publish, optimize, research, create, update, analyze).`,
        dataSource: `• Кластеры и их метрики → Cloudflare (impressions) + Google Search Console (clicks, CTR, position)
• Действия агента → внутренний лог AI Agent (publish, optimize, research, create, update, analyze)
• Цели → конфигурация аккаунта (target traffic / target leads)`,
      },
      {
        id: 'content-funnel',
        name: 'ContentFunnel',
        purpose: 'Показываем, что вся наша работа с контентом создаёт готовую воронку. Люди могут легко увидеть путь: от impressions до captured leads. Это визуализация всего value chain Tely.',
        logic: `5 ступеней:
• Impressions — сколько раз наш контент отобразился (crawlers, поисковая выдача)
• Clicks — сколько людей реально упало на сайт
• Identified Visitors — из тех кто упал, кого мы смогли идентифицировать через RB2B
• Contacted Leads — те, с кем AI sales agent начал общаться
• Captured Leads — те, кто оставил контакт или перешёл на целевую страницу (pricing, demo, и т.д.)
Каждая ступень: count + conversion rate от предыдущей. Разбивка по кластерам.`,
        dataSource: `• Impressions → Cloudflare allowed requests (все страницы, где мы появились)
• Clicks (Total Referrals) → Cloudflare referral data / Google Search Console clicks
• Identified Visitors → RB2B (де-анонимизированные посетители)
• Contacted Leads → AI Sales Agent (агент отправил outreach)
• Captured Leads → AI Sales Agent (лид оставил финальный контакт)`,
      },
      {
        id: 'visitor-industry-summary',
        name: 'VisitorIndustrySummary',
        purpose: 'Из RB2B мы знаем, из каких индустрий приходят идентифицированные визиторы. Показываем клиенту: к вам много заходят из такой-то индустрии — возможно, стоит создать новый topical cluster, который будет таргетировать этих людей.',
        logic: `Группировка identified visitors по полю industry (из RB2B enrichment).
Pipeline Value per industry = visitors × deal size.
Показывает top индустрий: count, %, pipeline value.
Если у индустрии много визиторов, но мало контента → рекомендация создать кластер.`,
        dataSource: `• Identified Visitors + Industry → RB2B (company data enrichment: industry, employee count, revenue)
• Pipeline Value → visitors × deal size (настройка аккаунта)`,
      },
    ],
  },

  /* ───────────────────── 2. Traffic ───────────────────── */
  {
    id: 'traffic',
    title: 'Traffic',
    description: 'Детальная аналитика трафика — показываем клиенту, сколько реального трафика генерирует Tely, из каких источников, какие страницы перформят.',
    components: [
      {
        id: 'metric-articles-published',
        name: 'Articles Published',
        purpose: 'Люди часто спрашивают: сколько статей было опубликовано за месяц? Это самый частый запрос от клиентов — они хотят видеть объём работы.',
        logic: `Count опубликованных статей за выбранный период. При compare mode — % изменения vs предыдущий период.`,
        dataSource: `• Внутренняя БД Tely (таблица articles, фильтр по publish_date)`,
      },
      {
        id: 'metric-content-pieces',
        name: 'Total Content Pieces',
        purpose: 'Общий размер Knowledge Base клиента. Когда мы продаём, мы говорим: ваша финальная задача — сбилдить этот asset, контент, который весь одновременно драйвит вам трафик. Клиент должен понимать его размер.',
        logic: `Count всех content pieces (articles + landing pages) — полный размер базы.`,
        dataSource: `• Внутренняя БД Tely (articles + pages)`,
      },
      {
        id: 'metric-organic-clicks',
        name: 'Total Organic Clicks',
        purpose: 'Сколько людей реально перешли на сайт. Основная traffic-метрика.',
        logic: `Сумма кликов (referrals) по всем страницам за период. При compare mode — % изменения.`,
        dataSource: `• Cloudflare (total referrals / clicks за период)`,
      },
      {
        id: 'metric-impressions',
        name: 'Total Impressions',
        purpose: 'Сколько раз контент клиента появился в различных выдачах — поисковой, AI-движков, crawlers.',
        logic: `Сумма impressions за период.`,
        dataSource: `• Cloudflare allowed requests`,
      },
      {
        id: 'metric-ctr',
        name: 'Avg. CTR',
        purpose: 'Отношение кликов к impressions. Если CTR низкий — нужно оптимизировать titles и meta descriptions.',
        logic: `CTR = Total Clicks / Total Impressions × 100%.`,
        dataSource: `• Рассчитывается на базе данных Cloudflare (clicks / impressions)`,
      },
      {
        id: 'metric-leads',
        name: 'Leads Generated',
        purpose: 'Сколько лидов принёс контент за выбранный период. Все identified visitors + люди, которые сконтактировались с AI sales agent, но не были идентифицированы через RB2B.',
        logic: `Count за период: identified visitors (RB2B) + contacted non-identified (AI Sales Agent).`,
        dataSource: `• RB2B (identified visitors)
• AI Sales Agent (contacted leads, которые не были в RB2B)`,
      },
      {
        id: 'unified-traffic-trend',
        name: 'UnifiedTrafficTrend',
        purpose: 'Люди видят, как у них трафик растёт по дням. Основная задача — показать рост. Возможно добавить переключалку: по дням / по неделям / по месяцам.',
        logic: `Line chart с данными по дням (или неделям/месяцам).
Всё на базе данных Cloudflare — impressions и clicks.
Фильтруется по DateRange.`,
        dataSource: `• Cloudflare Analytics API (impressions + referrals по дням)`,
      },
      {
        id: 'traffic-by-engine',
        name: 'Traffic by Engine',
        purpose: 'Удобно видеть распределение — откуда идёт доминирующий трафик. Google, Bing, AI-движки — всё в одном pie chart.',
        logic: `Pie chart: Google, Bing, DuckDuckGo, Yahoo + ChatGPT, Perplexity, Gemini, Claude, Copilot, Meta AI.`,
        dataSource: `• Cloudflare Analytics API (referrer header breakdown)`,
      },
      {
        id: 'top-pages',
        name: 'Top Pages',
        purpose: 'Какие конкретно страницы перформят. Люди очень часто запрашивают эти данные и сами их отслеживают. Добавить колонку Trend — маленький sparkline (зелёный если рост, красный если падение).',
        logic: `Таблица: Title, Clicks, Impressions, CTR, Trend (sparkline).
Данные по статьям, которые мы знаем что опубликовали — по ним из Cloudflare берём переходы на сами статьи и клики по картинкам внутри.
Сортировка по кликам. Клик → детальная страница.`,
        dataSource: `• Cloudflare (per-URL: referrals, impressions)
• Внутренняя БД Tely (список опубликованных статей — знаем URL)`,
      },
      {
        id: 'geography-section',
        name: 'GeographySection',
        purpose: 'У нас есть клиенты, которые хотят расти в определённых регионах. Важно показывать, что трафик растёт на их целевом географическом рынке.',
        logic: `Карта мира + таблица top стран по сессиям с bounce rate и avg duration.`,
        dataSource: `• Cloudflare Analytics API (geo distribution по IP)`,
      },
    ],
  },

  /* ───────────────────── 3. Topics ───────────────────── */
  {
    id: 'topics',
    title: 'Topics',
    description: 'Вся бизнес-логика на Topics — давать новые идеи для топиков клиентам. Клиенты заходят, видят предложения, говорят "окей, мне этот топик нравится" — и добавляют его.',
    components: [
      {
        id: 'content-funnel-topics',
        name: 'ContentFunnel (на Topics)',
        purpose: 'Та же воронка, что на Dashboard, но на Topics есть возможность посмотреть разбивку по кластерам и статьям. Люди могут увидеть: какие конкретные кластеры драйвят лидов, какие конкретные статьи больше всего драйвят лидов — более детальная информация по воронке.',
        logic: `5 ступеней: Impressions → Clicks → Identified → Contacted → Captured.
На Topics — расширенный вид с разбивкой:
• По кластерам: какой кластер на каждой ступени воронки даёт больше всего
• По статьям: внутри кластера — какие конкретные статьи конвертят
Клик по кластеру/статье → детализация.`,
        dataSource: `• Impressions → Cloudflare allowed requests (per URL → per cluster)
• Clicks → Cloudflare referrals (per URL → per cluster)
• Identified Visitors → RB2B (sourceUrl → статья → кластер)
• Contacted / Captured → AI Sales Agent (привязка к source article)`,
      },
      {
        id: 'new-topic-opportunities',
        name: 'New Topic Opportunities',
        purpose: `Два источника новых топиков:
1) Competitor Gaps — автоматизированный анализ контента конкурентов. Система сканирует сайты конкурентов, находит темы, которые они покрывают, а клиент — нет. Раньше это делалось руками через Ahrefs, теперь происходит автоматически.
2) Visitor Industries — анализ по данным RB2B: к вам на сайт заходят люди из определённых индустрий (например, FinTech или Healthcare), но у вас нет topical clusters, которые таргетируют эту аудиторию. Рекомендация: создать кластер под эту индустрию.`,
        logic: `Автоматический анализ конкурентов:
• Список конкурентов → AI Agent сканирует их контент
• Находит темы, которые покрывают конкуренты, но не мы
• Генерирует suggested topics с оценкой impact и keywords
• Клиент видит предложения, одобряет понравившиеся → они добавляются как новые кластеры

Также: Visitor Industry Summary (та же логика что на Dashboard) — если много визиторов из определённой индустрии, предлагаем создать кластер под неё.`,
        dataSource: `• Конкуренты → AI Agent (web scraping + Ahrefs/SEMrush API)
• Keywords → SEO tools API
• Industry insights → RB2B (visitor industries)
• Предложения → AI Agent (gap analysis + keyword research)`,
      },
    ],
  },

  /* ───────────────────── 4. Leads ───────────────────── */
  {
    id: 'leads',
    title: 'Leads',
    description: 'Управление лидами: метрики, pipeline, распределение по индустриям/кластерам, таблица с CRM-интеграцией.',
    components: [
      {
        id: 'metric-identified-visitors',
        name: 'Leads Identified',
        purpose: 'Все идентифицированные посетители = лиды. Если мы знаем кто они (имя, компания, индустрия) — это уже лид. Первый уровень воронки.',
        logic: `Count идентифицированных посетителей за выбранный период.
При compare mode — % изменения vs предыдущий период.`,
        dataSource: `• RB2B (де-анонимизация посетителей по IP/cookie → name, email, company, title, industry)`,
      },
      {
        id: 'metric-leads-contacted',
        name: 'Leads Contacted',
        purpose: 'Сколько лидов AI sales agent успел проконтактировать — отправил первое сообщение. Второй уровень воронки: identified → contacted.',
        logic: `Count лидов со статусом contacted / qualified / captured / converted за период.
При compare mode — % изменения.`,
        dataSource: `• AI Sales Agent (статус: agent отправил первое сообщение)`,
      },
      {
        id: 'metric-organic-leads-captured',
        name: 'Leads Captured',
        purpose: 'Сколько лидов реально захвачено — ответили агенту, оставили контакт, перешли на целевую страницу. Финальный уровень воронки. Это конечный результат работы Tely.',
        logic: `Count лидов со статусом captured / qualified / converted за период.
При compare mode — % изменения.`,
        dataSource: `• AI Sales Agent (лид ответил и оставил контакт)`,
      },
      {
        id: 'leads-pipeline-value',
        name: 'Pipeline Value',
        purpose: 'Та же логика, что на Dashboard — перемножаем captured leads на deal size. Deal size — настраиваемое поле на уровне аккаунта. Клиент видит: вот столько денег потенциально в pipeline благодаря Tely.',
        logic: `Pipeline Value = Captured Leads × Deal Size
• Deal Size — настраиваемое поле (пресеты: $500, $1K, $5K, $10K, $50K + custom)
• При изменении deal size мгновенно пересчитывается pipeline
• Compare mode: % изменения vs предыдущий период`,
        dataSource: `• Captured Leads → AI Sales Agent (contacted + qualified + converted)
• Deal Size → настройка аккаунта (поле "Average Deal Size")`,
      },
      {
        id: 'leads-by-industry',
        name: 'Leads by Industry / Topic',
        purpose: 'Распределение всех лидов по индустриям или topical clusters. Клиент видит: из каких индустрий приходят лиды и какой контент их привлекает. Помогает понять, на какие аудитории делать ставку.',
        logic: `Два режима (toggle):
• By Industry — группировка лидов по полю industry из RB2B enrichment
• By Topic — группировка по sourceUrl → topical cluster (какую статью посетили → к какому кластеру относится)
Full-width pie chart с легендой.`,
        dataSource: `• Leads + Industry → RB2B (company data enrichment)
• Source URL → RB2B (какую страницу посетил)
• Topic mapping → внутренняя БД Tely (URL → topical cluster)`,
      },
      {
        id: 'leads-table',
        name: 'Identified Visitors Table',
        purpose: 'Основная таблица лидов с фильтрацией по статусу, поиском, сортировкой. Интеграция с CRM (Salesforce, HubSpot, Pipedrive) — двусторонняя синхронизация. Клик по лиду открывает ConversationPage — полноэкранную страницу переписки AI sales agent с лидом.',
        logic: `Таблица: Name, Company, Industry, Title, Source, Status, Value.
Фильтры: по статусу (new, identified, contacted, qualified, captured, converted), по индустрии, поиск по имени/компании.
Сортировка: по value, дате, имени.
CRM: кнопка Connect CRM → модалка выбора (Salesforce, HubSpot, Pipedrive) → синхронизация лидов.
Клик по строке → ConversationPage (email-тред AI agent ↔ лид + Agent Rules).`,
        dataSource: `• Список лидов → RB2B (enrichment: name, email, company, industry, title, employee count, revenue)
• Статус лида → AI Sales Agent (new → identified → contacted → qualified → captured → converted)
• Source URL → RB2B (какую страницу посетил лид)
• CRM sync → Salesforce / HubSpot / Pipedrive API (двусторонняя синхронизация)
• Переписка (ConversationPage) → AI Sales Agent (история сообщений)`,
      },
    ],
  },

  /* ───────────────────── 5. Conversation with Sales Agent ───────────────────── */
  {
    id: 'conversation',
    title: 'Conversation',
    description: 'Полноэкранная страница переписки AI Sales Agent с лидом. Открывается по клику на лида в таблице.',
    components: [
      {
        id: 'conversation-thread',
        name: 'Conversation Thread',
        purpose: 'Email-тред и чат между AI sales agent и лидом. Агент автоматически персонализирует каждое сообщение на основе данных лида (компания, должность, индустрия) и содержания страницы, на которой лид находился. Каждое сообщение адаптировано — не шаблонный outreach.',
        logic: `Агент генерирует первое сообщение на основе:
• Source article — какую статью читал лид (из RB2B sourceUrl)
• Данные лида — компания, индустрия, должность, размер (из RB2B enrichment)
• Контекст статьи — ключевые тезисы страницы, на которой был лид

Дальнейшие сообщения адаптируются к ответам лида.
Глубина переписки зависит от статуса: identified → 1-2 msg, contacted → 3 msg, captured → 4-5 msg.`,
        dataSource: `• Переписка → AI Sales Agent (история email-сообщений)
• Данные лида → RB2B enrichment (name, company, industry, title)
• Контент страницы → внутренняя БД Tely (содержание статьи по sourceUrl)`,
      },
      {
        id: 'agent-rules-panel',
        name: 'Agent Rules',
        purpose: 'AI-чат для создания правил, по которым agent ведёт conversations с лидами. По сути это наш основной AI-чат, но в версии для настройки outreach-правил. Клиент создаёт rules — агент их применяет во всех будущих разговорах.',
        logic: `Клиент пишет инструкции в чате → система сохраняет как rules.
Примеры rules:
• "Всегда упоминай кейс-стади для FinTech компаний"
• "Если спрашивают про цену — предлагай 14-дневный триал"
• "Follow up через 24 часа если нет ответа"
• "Для компаний с 500+ сотрудников предлагай enterprise план"

Rules применяются ко всем conversations на уровне аккаунта.`,
        dataSource: `• Agent Rules → внутренняя БД Tely (настройки outreach per аккаунт)
• Данные лида (для контекста) → RB2B enrichment`,
      },
      {
        id: 'lead-info-panel',
        name: 'Lead Info Panel',
        purpose: 'Дополнительная информация о лиде — кто этот человек, из какой компании, какая должность. Даёт контекст при просмотре переписки.',
        logic: `Карточка лида: аватар, статус (identified / contacted / captured).
Поля из RB2B enrichment: Email, Title, Company, Industry, Employees, Est. Revenue.
LinkedIn link, Source Page (какую статью читал), Lead Value.`,
        dataSource: `• Все поля → RB2B enrichment (name, email, company, title, industry, employeeCount, estimatedRevenue, linkedinUrl)
• Source URL → RB2B (какую страницу посетил)
• Lead Value → deal size из настроек аккаунта`,
      },
    ],
  },

  /* ───────────────────── 6. Reports ───────────────────── */
  {
    id: 'reports',
    title: 'Reports',
    description: 'Ежемесячные отчёты в продукте — клиенты могут открыть историю, посмотреть что делалось за каждый месяц. Решает проблему потерянных email-отчётов.',
    components: [
      {
        id: 'report-list',
        name: 'Report List',
        purpose: 'Клиенты хотят иметь возможность открыть исторические отчёты и посмотреть, что мы делали за прошлые месяцы. Сейчас в почте это неудобно находить, плюс у нас email-отправка отчётов не работает из-за проблем с Google Search Console. Поэтому вся история доступна прямо в продукте.',
        logic: `Карточки: title, period, key metrics preview (clicks, leads, pipeline), trend indicators.
Сортировка: по дате (новые сверху).
Клик → ReportDetail.`,
        dataSource: `• Список отчётов → внутренняя БД Tely (автогенерация по окончании каждого месяца)
• Preview метрики → snapshot данных за месяц`,
      },
      {
        id: 'report-executive-summary',
        name: 'Executive Summary',
        purpose: 'AI-генерированный текстовый анализ за месяц. Главная ценность — клиент получает не просто цифры, а осмысленный narrative: что произошло, что выросло, на что обратить внимание.',
        logic: `AI Agent генерирует narrative на основе всех метрик за месяц.
Анализирует: рост/падение, причины, рекомендации.
Формат: 2-3 абзаца текста.`,
        dataSource: `• Все метрики за месяц → агрегация Cloudflare + RB2B + AI Sales Agent
• Генерация текста → AI Agent (LLM с контекстом данных)`,
      },
      {
        id: 'report-traffic-overview',
        name: 'Traffic Overview',
        purpose: 'Секция трафика в отчёте: KPI-карточки (Clicks, Impressions, CTR) + area chart по дням + AI-narrative по трафику.',
        logic: `3 KPI карточки с % изменения vs прошлый месяц.
Area chart: clicks по дням за весь период.
Narrative: AI-анализ трафика.`,
        dataSource: `• Clicks, Impressions, CTR → Cloudflare Analytics API (агрегация за месяц)
• Daily data → Cloudflare (per-day breakdown)
• Comparison → автоматически: текущий месяц vs предыдущий`,
      },
      {
        id: 'report-traffic-by-source',
        name: 'Traffic by Source',
        purpose: 'Распределение трафика по источникам: Google, Bing, ChatGPT, Perplexity и др. Horizontal bar chart + таблица с % изменениями + AI-narrative.',
        logic: `Horizontal bar chart: источники с цветовой кодировкой.
Таблица: source, clicks, % change vs прошлый месяц.
Narrative: AI-анализ каналов.`,
        dataSource: `• Traffic by source → Cloudflare Analytics API (referrer breakdown)
• Change % → сравнение с предыдущим месяцем`,
      },
      {
        id: 'report-cluster-performance',
        name: 'Topical Cluster Performance',
        purpose: 'Таблица перформанса кластеров за месяц: какие кластеры растут, какие падают. Помогает клиенту понять, на какие темы делать ставку.',
        logic: `Таблица: Cluster, Pages, Clicks, Impressions, CTR, Leads, Growth%.
Narrative: AI-анализ кластеров — рекомендации по scale/update/delete.`,
        dataSource: `• Cluster metrics → Cloudflare (per URL → per cluster aggregation)
• Leads per cluster → RB2B (sourceUrl → article → cluster)
• Growth → сравнение с предыдущим месяцем`,
      },
      {
        id: 'report-lead-generation',
        name: 'Lead Generation',
        purpose: 'Секция лидов в отчёте: KPIs (Identified, Captured, Pipeline Value) + Leads by Status bar + Leads by Industry breakdown + Notable Leads таблица + AI-narrative.',
        logic: `3 KPI карточки + stacked bar (Leads by Status: New, Contacted, Qualified, Converted).
Industry breakdown: horizontal bars.
Notable Leads: таблица top лидов (name, company, industry, value, status).
Narrative: AI-анализ лидогенерации.`,
        dataSource: `• Identified → RB2B
• Captured → AI Sales Agent
• Pipeline → leads × deal size
• Industry/Status → RB2B enrichment + AI Sales Agent`,
      },
      {
        id: 'report-roas',
        name: 'Content ROAS',
        purpose: 'ROI секция: Monthly Cost, Pipeline Value, ROAS множитель, Cost per Lead. Визуальный ratio bar — наглядно показывает соотношение затрат и pipeline.',
        logic: `4 KPI карточки: Monthly Cost, Pipeline, ROAS, Cost/Lead.
Ratio bar: pipeline (indigo) vs cost (gray).
ROAS = Pipeline / Monthly Cost.`,
        dataSource: `• Monthly Cost → биллинг Tely (стоимость подписки)
• Pipeline → leads × deal size
• ROAS, Cost/Lead → расчёт на основе cost и leads`,
      },
      {
        id: 'report-agent-actions',
        name: 'Agent Actions',
        purpose: 'Какие действия AI Agent предпринял или рекомендует по каждому кластеру на основе анализа за месяц. Те же 4 состояния: Scale Production, Update Content, Delete & Merge, Publish & Monitor.',
        logic: `Grid карточек: по одной на кластер.
Каждая: cluster name, action type (цветовая кодировка), status (Working/Queued/Monitoring), summary.`,
        dataSource: `• Cluster analysis → AI Agent (анализ метрик за месяц)
• Actions → AI Agent (автоматическое определение приоритета)`,
      },
      {
        id: 'report-email-template',
        name: 'Email Template',
        purpose: 'Email-версия отчёта для отправки клиенту. Inline styles (table layout), без CSS — совместимость со всеми email-клиентами. Содержит те же секции, но в упрощённом email-safe формате.',
        logic: `Table-based layout (600px ширина).
Секции: Header, Key Metrics (3 KPIs), Executive Summary, Performance Snapshot (таблица всех метрик), Cluster Performance (таблица), Agent Actions, Footer.
Все стили inline. Без recharts — только текст и таблицы.
Кнопка "Preview Email" в ReportDetail открывает модалку с preview.`,
        dataSource: `• Те же данные, что и ReportDetail
• Формат → inline styles, table layout, email-safe HTML`,
      },
    ],
  },

  /* ───────────────────── 7. Date Picker ───────────────────── */
  {
    id: 'filtering',
    title: 'Date Picker',
    description: 'Глобальный фильтр по периоду — влияет на все данные в продукте.',
    components: [
      {
        id: 'date-range',
        name: 'DateRangePicker',
        purpose: 'Когда люди анализируют перформанс, они хотят посмотреть сколько было сгенерировано за определённый период. Например, клиент с нами 3 месяца — хочет увидеть сравнительный рост. Сейчас это делается в других тулах (GSC, Cloudflare), что занимает много времени и требует обучения клиентов дополнительным инструментам.',
        logic: `Пресеты: 7d, 28d (default), 3m, 6m, 1y, custom range.
Compare mode: автоматически вычисляет previous period равной длины для сравнения.
Скрыт на табах Reports и Handoff.`,
        dataSource: `• Чисто UI — фильтрует все данные на клиенте по выбранным датам
• Все API-запросы принимают startDate / endDate параметры`,
      },
    ],
  },

  /* ───────────────────── 9. Chat ───────────────────── */
  {
    id: 'chat',
    title: 'Chat',
    description: 'AI-ассистент: команды, роутинг, интеграция с дашбордом.',
    components: [
      {
        id: 'chat-panel',
        name: 'ChatPanel',
        purpose: `Пользователь по мере работы с продуктом привыкает к AI-ассистенту, который доступен из любого экрана. Вместо того чтобы вручную искать данные в дашбордах, он просто задаёт вопрос в чат — например «какие страны генерят больше всего лидов за март?» или «покажи топ-5 статей по конверсии».
Под капотом: запрос уходит в LLM, который формирует SQL/API-запрос к базе данных аккаунта, получает результат, рендерит ответ в виде текста, таблицы или графика. Аналог реализации чата у PostHog — custom query к live DB → LLM рендерит и объясняет результат.`,
        logic: `Сообщения user/assistant с markdown, action buttons, chart widgets.
Типы ответов: текст, графики (line/bar/pie/table), быстрые действия.
Поток: user question → LLM → SQL/API query → result → LLM renders response.`,
        dataSource: `• Ответы → LLM API (Claude / GPT) с контекстом данных аккаунта
• Chart data → custom query к live DB (Cloudflare, GSC, RB2B)
• Action buttons → hardcoded quick prompts`,
      },
      {
        id: 'use-chat',
        name: 'Chat Commands',
        purpose: `Для продвинутых пользователей, которые уже долго работают с продуктом. Вместо свободного текста они могут вводить slash-команды (/) для прямого вызова конкретных суб-агентов: /traffic, /leads, /topics, /report и т.д. Каждая команда — это шорткат к специализированному агенту, который сразу выполняет нужный анализ без промежуточных уточнений.`,
        logic: `Команды: /traffic overview, /traffic top-pages, /leads pipeline, /ai visibility, /topics clusters, /report, /compare и др.
Каждая команда вызывает соответствующий суб-агент и форматирует ответ.
Фильтрация команд по мере ввода текста после /.
Natural language fallback для свободных вопросов.`,
        dataSource: `• Команды → маршрутизация к специализированным суб-агентам
• Natural language → LLM с контекстом метрик аккаунта`,
      },
    ],
  },
];
