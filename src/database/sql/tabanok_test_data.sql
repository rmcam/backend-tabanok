--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, avatar, profile, roles, role, "isActive", "createdAt", "updatedAt", "firstName", "lastName", languages, status, preferences) FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, streak, "lastActivity", settings, preferences, "isActive", points, level, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: achievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement (id, name, description, category, "requiredValue", "pointsReward", "iconUrl", criteria, "isSecret", "timesAwarded", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (id, name, description, type, requirement, "bonusPoints", badge, "isSecret", tiers, "unlockedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: topic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity (id, title, description, type, difficulty, content, points, "timeLimit", "topicId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: badge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.badge (id, name, description, category, tier, "requiredPoints", "iconUrl", requirements, "isSpecial", "expirationDate", "timesAwarded", benefits, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cultural_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cultural_content (id, title, description, content, category, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation (id, "userId", "culturalContentId", score, answers, "attemptsCount", "averageScore", "timeSpentSeconds", "progressMetrics", feedback, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, title, description, type, content, difficulty, points, "timeLimit", "isActive", "topicId", tags, "timesCompleted", "averageScore", "createdAt", "updatedAt", "lessonId", "progressId") FROM stdin;
\.


--
-- Data for Name: gamification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamification (id, "userId", points, level, experience, "nextLevelExperience", achievements, badges, stats, "recentActivities", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gamification_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamification_achievements ("gamificationId", "achievementId") FROM stdin;
\.


--
-- Data for Name: gamification_missions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamification_missions (gamification_id, mission_id) FROM stdin;
\.


--
-- Data for Name: lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson (id, title, description, "order", "isLocked", "isCompleted", "requiredPoints", "isActive", "unityId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: migrations_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations_test (id, "timestamp", name) FROM stdin;
1	1709853742000	CreateUserTable1709853742000
2	1709853742000	CreateTables1709853742000
3	1709853742001	UpdateActivityDescription1709853742001
4	1709853742001	CreateAccountTable1709853742001
5	1709853742003	CreateVocabularyTable1709853742003
6	1709854000000	FixActivityTypes1709854000000
7	1711558800000	CreateEvaluationTable1711558800000
8	1711558800000	CreateCulturalContent1711558800000
9	1711558800001	UpdateCulturalContent1711558800001
10	1711558900000	UpdateCulturalContentCategory1711558900000
11	1711558900000	AddCategoryColumn1711558900000
12	1711558900002	AddContentColumn1711558900002
13	1711559000000	AddContentAndCategoryColumns1711559000000
14	1711559100000	CreateGamificationTables1711559100000
15	1711559100001	CreateAchievementsTable1711559100001
16	1711559100004	UpdateGamificationAndUserTables1711559100004
17	1711559200000	CreateStatisticsTable1711559200000
18	1711559300000	UpdateStatisticsWithCategories1711559300000
19	1711559400000	CreateTagsTable1711559400000
20	1711642800000	UpdateUserNameFields1711642800000
21	1711676400000	CreateStreakTable1711676400000
22	1711676500000	CreateMissionTemplateTable1711676500000
23	1711676600000	AddBonusConditionsToMission1711676600000
24	1743750495499	FixLanguagesArrayType1743750495499
25	1743792686348	20250404135121AddUserStatusColumn1743792686348
26	1743793000000	AddStatusColumnToUsers1743793000000
27	1743793100000	AddPreferencesColumnToUsers1743793100000
\.


--
-- Data for Name: mission_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mission_templates (id, title, description, type, frequency, "baseTargetValue", "baseRewardPoints", "rewardBadge", "minLevel", "maxLevel", "difficultyScaling", requirements, "bonusConditions") FROM stdin;
895493fd-fd05-4b95-b42d-261e87afc536	Maestro de Lecciones	Completa un número de lecciones basado en tu nivel	COMPLETE_LESSONS	DAILY	3	50	\N	1	0	[{"rewardMultiplier": 1, "targetMultiplier": 1}, {"rewardMultiplier": 1.3, "targetMultiplier": 1.5}, {"rewardMultiplier": 1.6, "targetMultiplier": 2}]	{"minimumStreak": 0}	[{"condition": "perfect_score", "multiplier": 1.2, "description": "Bonus por puntuación perfecta"}, {"condition": "streak_active", "multiplier": 1.1, "description": "Bonus por racha activa"}]
4e0c2bef-1436-4cb1-b360-373fd9275ff4	Desafío Cultural	Explora contenido cultural y gana puntos extra	CULTURAL_CONTENT	WEEKLY	5	100	\N	5	0	[{"rewardMultiplier": 1, "targetMultiplier": 1}, {"rewardMultiplier": 1.4, "targetMultiplier": 1.3}, {"rewardMultiplier": 1.8, "targetMultiplier": 1.6}]	{"minimumStreak": 3}	[{"condition": "streak_active", "multiplier": 1.3, "description": "Bonus por racha activa"}]
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progress (id, score, "isCompleted", answers, "isActive", "createdAt", "updatedAt", "userId", "exerciseId") FROM stdin;
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rewards (id, name, title, description, type, trigger, "pointsCost", criteria, conditions, "rewardValue", "isLimited", "limitedQuantity", "startDate", "endDate", "timesAwarded", points, "isSecret", "isActive", "expirationDays", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statistics (id, "userId", "learningMetrics", "progressByCategory", "weeklyProgress", "monthlyProgress", "achievementStats", "badgeStats", "strengthAreas", "improvementAreas", "createdAt", "updatedAt", "categoryMetrics", "learningPath") FROM stdin;
\.


--
-- Data for Name: streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streaks (id, "userId", "currentStreak", "longestStreak", "lastActivityDate", "graceDate", "usedGracePeriod", "streakHistory", "currentMultiplier") FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name, type, color, description, "parentId", metadata, "usageCount", "createdAt", "updatedAt") FROM stdin;
d1f2f7ea-1cd9-4609-ab8a-9b8a9a698242	Principiante	difficulty	green	Contenido para nivel principiante	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
86377e59-18fd-454e-9abc-62d969210d71	Intermedio	difficulty	yellow	Contenido para nivel intermedio	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
e811dcd6-7f7c-478c-9271-f47198470c13	Avanzado	difficulty	red	Contenido para nivel avanzado	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
402ebcbb-5911-4f77-96a6-a5ba6ddcb22b	Vocabulario	topic	blue	Palabras y frases en Kamëntsá	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
81d1e4ff-d09e-4fb3-86d5-089741ba207f	Gramática	topic	purple	Reglas gramaticales del Kamëntsá	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
1a9da874-ea66-4934-baa6-3b915f20b7b3	Pronunciación	topic	pink	Guías de pronunciación	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
f49fd7e6-91f9-4d7d-bd20-c7326c03f810	Lectura	skill	orange	Ejercicios de comprensión lectora	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
a6c53afd-5062-4801-978f-4ee452f165b8	Escritura	skill	green	Práctica de escritura	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
a68586d5-2616-480c-bea5-52ff1ccabee9	Conversación	skill	blue	Práctica de diálogo	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
27ad15ca-2268-4c37-a731-7de00eb03603	Festividades	cultural	yellow	Celebraciones tradicionales	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
4b67fe7d-5f10-4351-892d-2b886bf51954	Costumbres	cultural	purple	Tradiciones y costumbres	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
47eb5484-80e3-412f-bca4-a1fcebf47065	Historia	cultural	red	Historia del pueblo Kamëntsá	\N	\N	0	2025-04-04 20:17:55.343428	2025-04-04 20:17:55.343428
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, title, description, "order", "isLocked", "requiredPoints", "isActive", "unityId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: unities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unities (id, title, description, "order", "isLocked", "requiredPoints", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_achievements ("userId", "achievementId", status, progress, "completedAt", "dateAwarded", "createdAt") FROM stdin;
\.


--
-- Data for Name: user_rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_rewards ("userId", "rewardId", status, metadata, "consumedAt", "expiresAt", "dateAwarded", "createdAt") FROM stdin;
\.


--
-- Data for Name: vocabulary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vocabulary (id, "wordKamentsa", "wordSpanish", pronunciation, "culturalContext", "audioUrl", "imageUrl", examples, category, "difficultyLevel", "topicId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: migrations_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_test_id_seq', 27, true);


--
-- PostgreSQL database dump complete
--

