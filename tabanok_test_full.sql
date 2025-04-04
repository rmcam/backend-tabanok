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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: achievement_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.achievement_type_enum AS ENUM (
    'LEVEL_REACHED',
    'LESSONS_COMPLETED',
    'PERFECT_SCORES',
    'STREAK_MAINTAINED',
    'CULTURAL_CONTRIBUTIONS',
    'POINTS_EARNED'
);


ALTER TYPE public.achievement_type_enum OWNER TO postgres;

--
-- Name: activity_difficulty_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.activity_difficulty_enum AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


ALTER TYPE public.activity_difficulty_enum OWNER TO postgres;

--
-- Name: activity_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.activity_type_enum AS ENUM (
    'vocabulary_quiz',
    'memory_game',
    'word_matching',
    'pronunciation_practice',
    'cultural_story'
);


ALTER TYPE public.activity_type_enum OWNER TO postgres;

--
-- Name: mission_frequency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mission_frequency AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY'
);


ALTER TYPE public.mission_frequency OWNER TO postgres;

--
-- Name: mission_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mission_type AS ENUM (
    'COMPLETE_LESSONS',
    'PRACTICE_EXERCISES',
    'EARN_POINTS',
    'MAINTAIN_STREAK',
    'CULTURAL_CONTENT',
    'COMMUNITY_INTERACTION'
);


ALTER TYPE public.mission_type OWNER TO postgres;

--
-- Name: rewards_trigger_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rewards_trigger_enum AS ENUM (
    'level_up'
);


ALTER TYPE public.rewards_trigger_enum OWNER TO postgres;

--
-- Name: rewards_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rewards_type_enum AS ENUM (
    'badge',
    'points',
    'achievement',
    'cultural',
    'experience',
    'content'
);


ALTER TYPE public.rewards_type_enum OWNER TO postgres;

--
-- Name: tag_color_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tag_color_enum AS ENUM (
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'gray'
);


ALTER TYPE public.tag_color_enum OWNER TO postgres;

--
-- Name: tag_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tag_type_enum AS ENUM (
    'difficulty',
    'topic',
    'skill',
    'cultural',
    'custom'
);


ALTER TYPE public.tag_type_enum OWNER TO postgres;

--
-- Name: user_achievements_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_achievements_status_enum AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.user_achievements_status_enum OWNER TO postgres;

--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'user',
    'admin',
    'teacher'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive',
    'banned'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    "lastActivity" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    settings jsonb DEFAULT '{}'::jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: achievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    "requiredValue" integer NOT NULL,
    "pointsReward" integer NOT NULL,
    "iconUrl" character varying(255),
    criteria jsonb DEFAULT '{}'::jsonb NOT NULL,
    "isSecret" boolean DEFAULT false NOT NULL,
    "timesAwarded" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievement OWNER TO postgres;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    type public.achievement_type_enum NOT NULL,
    requirement integer NOT NULL,
    "bonusPoints" integer NOT NULL,
    badge jsonb,
    "isSecret" boolean DEFAULT false NOT NULL,
    tiers jsonb,
    "unlockedBy" jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- Name: activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    type public.activity_type_enum DEFAULT 'vocabulary_quiz'::public.activity_type_enum NOT NULL,
    difficulty public.activity_difficulty_enum DEFAULT 'beginner'::public.activity_difficulty_enum,
    content jsonb NOT NULL,
    points integer DEFAULT 0,
    "timeLimit" integer DEFAULT 300,
    "topicId" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.activity OWNER TO postgres;

--
-- Name: badge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badge (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    tier character varying(50) NOT NULL,
    "requiredPoints" integer NOT NULL,
    "iconUrl" character varying(255),
    requirements jsonb DEFAULT '{}'::jsonb NOT NULL,
    "isSpecial" boolean DEFAULT false NOT NULL,
    "expirationDate" date,
    "timesAwarded" integer DEFAULT 0 NOT NULL,
    benefits jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.badge OWNER TO postgres;

--
-- Name: cultural_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cultural_content (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description text,
    content text NOT NULL,
    category character varying DEFAULT 'general'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cultural_content OWNER TO postgres;

--
-- Name: evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "culturalContentId" uuid NOT NULL,
    score integer NOT NULL,
    answers jsonb,
    "attemptsCount" integer DEFAULT 0 NOT NULL,
    "averageScore" double precision DEFAULT 0 NOT NULL,
    "timeSpentSeconds" integer DEFAULT 0 NOT NULL,
    "progressMetrics" jsonb,
    feedback text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.evaluation OWNER TO postgres;

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    type character varying NOT NULL,
    content json NOT NULL,
    difficulty character varying NOT NULL,
    points integer NOT NULL,
    "timeLimit" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "topicId" uuid NOT NULL,
    tags text,
    "timesCompleted" integer DEFAULT 0 NOT NULL,
    "averageScore" double precision DEFAULT '0'::double precision NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lessonId" uuid,
    "progressId" uuid
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: gamification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    experience integer DEFAULT 0 NOT NULL,
    "nextLevelExperience" integer DEFAULT 100 NOT NULL,
    achievements jsonb DEFAULT '[]'::jsonb NOT NULL,
    badges jsonb DEFAULT '[]'::jsonb NOT NULL,
    stats jsonb DEFAULT '{"perfectScores": 0, "learningStreak": 0, "lessonsCompleted": 0, "exercisesCompleted": 0}'::jsonb NOT NULL,
    "recentActivities" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gamification OWNER TO postgres;

--
-- Name: gamification_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamification_achievements (
    "gamificationId" uuid NOT NULL,
    "achievementId" uuid NOT NULL
);


ALTER TABLE public.gamification_achievements OWNER TO postgres;

--
-- Name: gamification_missions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamification_missions (
    gamification_id uuid NOT NULL,
    mission_id uuid NOT NULL
);


ALTER TABLE public.gamification_missions OWNER TO postgres;

--
-- Name: lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying,
    "order" integer DEFAULT 1 NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "requiredPoints" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "unityId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lesson OWNER TO postgres;

--
-- Name: migrations_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations_test (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations_test OWNER TO postgres;

--
-- Name: migrations_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_test_id_seq OWNER TO postgres;

--
-- Name: migrations_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_test_id_seq OWNED BY public.migrations_test.id;


--
-- Name: mission_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mission_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    type public.mission_type NOT NULL,
    frequency public.mission_frequency NOT NULL,
    "baseTargetValue" integer NOT NULL,
    "baseRewardPoints" integer NOT NULL,
    "rewardBadge" jsonb,
    "minLevel" integer NOT NULL,
    "maxLevel" integer NOT NULL,
    "difficultyScaling" jsonb NOT NULL,
    requirements jsonb,
    "bonusConditions" jsonb
);


ALTER TABLE public.mission_templates OWNER TO postgres;

--
-- Name: progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    answers json,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid,
    "exerciseId" uuid
);


ALTER TABLE public.progress OWNER TO postgres;

--
-- Name: rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rewards (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    type public.rewards_type_enum DEFAULT 'badge'::public.rewards_type_enum NOT NULL,
    trigger public.rewards_trigger_enum DEFAULT 'level_up'::public.rewards_trigger_enum NOT NULL,
    "pointsCost" integer DEFAULT 0 NOT NULL,
    criteria json,
    conditions json,
    "rewardValue" json NOT NULL,
    "isLimited" boolean DEFAULT false NOT NULL,
    "limitedQuantity" integer,
    "startDate" timestamp without time zone,
    "endDate" timestamp without time zone,
    "timesAwarded" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "isSecret" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expirationDays" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rewards OWNER TO postgres;

--
-- Name: statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "learningMetrics" jsonb DEFAULT '{"averageScore": 0, "currentStreak": 0, "longestStreak": 0, "totalLessonsCompleted": 0, "totalTimeSpentMinutes": 0, "totalExercisesCompleted": 0}'::jsonb NOT NULL,
    "progressByCategory" jsonb DEFAULT '{"grammar": 0, "writing": 0, "vocabulary": 0, "comprehension": 0, "pronunciation": 0}'::jsonb NOT NULL,
    "weeklyProgress" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "monthlyProgress" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "achievementStats" jsonb DEFAULT '{"totalAchievements": 0, "lastAchievementDate": null, "achievementsByCategory": {}}'::jsonb NOT NULL,
    "badgeStats" jsonb DEFAULT '{"totalBadges": 0, "badgesByTier": {}, "lastBadgeDate": null}'::jsonb NOT NULL,
    "strengthAreas" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "improvementAreas" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "categoryMetrics" jsonb DEFAULT '{"vocabulary": {"type": "vocabulary", "status": "AVAILABLE", "progress": {"streak": 0, "averageScore": 0, "masteryLevel": 0, "lastPracticed": null, "totalExercises": 0, "timeSpentMinutes": 0, "completedExercises": 0}, "difficulty": "BEGINNER", "prerequisites": [], "subCategories": ["sustantivos", "verbos", "adjetivos", "frases_comunes"], "unlockRequirements": {"requiredScore": 0, "requiredCategories": []}}}'::jsonb NOT NULL,
    "learningPath" jsonb DEFAULT '{"customGoals": [], "currentLevel": 1, "nextMilestones": [], "recommendedCategories": ["vocabulary", "pronunciation"]}'::jsonb NOT NULL
);


ALTER TABLE public.statistics OWNER TO postgres;

--
-- Name: streaks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streaks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "lastActivityDate" timestamp without time zone,
    "graceDate" timestamp without time zone,
    "usedGracePeriod" boolean DEFAULT false NOT NULL,
    "streakHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "currentMultiplier" numeric(3,1) DEFAULT 1 NOT NULL
);


ALTER TABLE public.streaks OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    type public.tag_type_enum DEFAULT 'custom'::public.tag_type_enum NOT NULL,
    color public.tag_color_enum DEFAULT 'gray'::public.tag_color_enum NOT NULL,
    description text,
    "parentId" uuid,
    metadata jsonb,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: topic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topic (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.topic OWNER TO postgres;

--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying,
    "order" integer DEFAULT 1 NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "requiredPoints" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "unityId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: unities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying,
    "order" integer DEFAULT 1 NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "requiredPoints" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.unities OWNER TO postgres;

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_achievements (
    "userId" uuid NOT NULL,
    "achievementId" uuid NOT NULL,
    status public.user_achievements_status_enum DEFAULT 'IN_PROGRESS'::public.user_achievements_status_enum NOT NULL,
    progress json,
    "completedAt" timestamp without time zone,
    "dateAwarded" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO postgres;

--
-- Name: user_rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_rewards (
    "userId" uuid NOT NULL,
    "rewardId" uuid NOT NULL,
    status character varying DEFAULT 'ACTIVE'::character varying NOT NULL,
    metadata json,
    "consumedAt" timestamp without time zone,
    "expiresAt" timestamp without time zone,
    "dateAwarded" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_rewards OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    avatar character varying,
    profile jsonb DEFAULT '{}'::jsonb,
    roles text[] DEFAULT '{}'::text[],
    role public.user_role_enum DEFAULT 'user'::public.user_role_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    languages text[] DEFAULT '{}'::text[] NOT NULL,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vocabulary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vocabulary (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "wordKamentsa" character varying NOT NULL,
    "wordSpanish" character varying NOT NULL,
    pronunciation character varying,
    "culturalContext" text,
    "audioUrl" character varying,
    "imageUrl" character varying,
    examples text[],
    category text,
    "difficultyLevel" integer DEFAULT 1,
    "topicId" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vocabulary OWNER TO postgres;

--
-- Name: migrations_test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations_test ALTER COLUMN id SET DEFAULT nextval('public.migrations_test_id_seq'::regclass);


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
-- Data for Name: topic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic (id, name, description, "createdAt", "updatedAt") FROM stdin;
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, avatar, profile, roles, role, "isActive", "createdAt", "updatedAt", "firstName", "lastName", languages, status, preferences) FROM stdin;
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
-- Name: lesson PK_0ef25918f0237e68696dee455bd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson
    ADD CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY (id);


--
-- Name: rewards PK_3d947441a48debeb9b7366f8b8c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY (id);


--
-- Name: unities PK_42e005e82cfebf8cedfccd1a8f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unities
    ADD CONSTRAINT "PK_42e005e82cfebf8cedfccd1a8f0" PRIMARY KEY (id);


--
-- Name: streaks PK_52547016a1a6409f6e5287ed859; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT "PK_52547016a1a6409f6e5287ed859" PRIMARY KEY (id);


--
-- Name: progress PK_79abdfd87a688f9de756a162b6f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT "PK_79abdfd87a688f9de756a162b6f" PRIMARY KEY (id);


--
-- Name: user_rewards PK_8162d48f7242ea2e1410f5a763d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT "PK_8162d48f7242ea2e1410f5a763d" PRIMARY KEY ("userId", "rewardId");


--
-- Name: mission_templates PK_9df1a47e0c0eee2716157f76b64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mission_templates
    ADD CONSTRAINT "PK_9df1a47e0c0eee2716157f76b64" PRIMARY KEY (id);


--
-- Name: evaluation PK_b72edd439b9db736f55b584fa54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT "PK_b72edd439b9db736f55b584fa54" PRIMARY KEY (id);


--
-- Name: user_achievements PK_c1acd69cf91b1e353634c152dd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "PK_c1acd69cf91b1e353634c152dd7" PRIMARY KEY ("userId", "achievementId");


--
-- Name: exercises PK_c4c46f5fa89a58ba7c2d894e3c3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY (id);


--
-- Name: migrations_test PK_d3316bd67d81346cda98aa3e8f4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations_test
    ADD CONSTRAINT "PK_d3316bd67d81346cda98aa3e8f4" PRIMARY KEY (id);


--
-- Name: topics PK_e4aa99a3fa60ec3a37d1fc4e853; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY (id);


--
-- Name: gamification_achievements PK_gamification_achievements; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_achievements
    ADD CONSTRAINT "PK_gamification_achievements" PRIMARY KEY ("gamificationId", "achievementId");


--
-- Name: gamification_missions PK_gamification_missions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_missions
    ADD CONSTRAINT "PK_gamification_missions" PRIMARY KEY (gamification_id, mission_id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_userId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_key" UNIQUE ("userId");


--
-- Name: achievement achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT achievement_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activity activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);


--
-- Name: badge badge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badge
    ADD CONSTRAINT badge_pkey PRIMARY KEY (id);


--
-- Name: cultural_content cultural_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cultural_content
    ADD CONSTRAINT cultural_content_pkey PRIMARY KEY (id);


--
-- Name: gamification gamification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification
    ADD CONSTRAINT gamification_pkey PRIMARY KEY (id);


--
-- Name: statistics statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: topic topic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vocabulary vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vocabulary
    ADD CONSTRAINT vocabulary_pkey PRIMARY KEY (id);


--
-- Name: IDX_STREAK_USER; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_STREAK_USER" ON public.streaks USING btree ("userId");


--
-- Name: IDX_achievements_isSecret; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_achievements_isSecret" ON public.achievements USING btree ("isSecret");


--
-- Name: IDX_achievements_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_achievements_type" ON public.achievements USING btree (type);


--
-- Name: IDX_gamification_missions_gamification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_gamification_missions_gamification" ON public.gamification_missions USING btree (gamification_id);


--
-- Name: IDX_gamification_missions_mission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_gamification_missions_mission" ON public.gamification_missions USING btree (mission_id);


--
-- Name: idx_achievement_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_achievement_category ON public.achievement USING btree (category);


--
-- Name: idx_badge_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_badge_category ON public.badge USING btree (category);


--
-- Name: idx_badge_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_badge_tier ON public.badge USING btree (tier);


--
-- Name: idx_gamification_userId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_gamification_userId" ON public.gamification USING btree ("userId");


--
-- Name: idx_statistics_userId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_statistics_userId" ON public.statistics USING btree ("userId");


--
-- Name: idx_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_name ON public.tags USING btree (name);


--
-- Name: idx_tags_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_type ON public.tags USING btree (type);


--
-- Name: idx_tags_usage_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_usage_count ON public.tags USING btree ("usageCount" DESC);


--
-- Name: evaluation FK_115170ae291135522efdb1fb23c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT "FK_115170ae291135522efdb1fb23c" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: account FK_account_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "FK_account_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity FK_activity_topic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "FK_activity_topic" FOREIGN KEY ("topicId") REFERENCES public.topic(id);


--
-- Name: streaks FK_bccb82e01bb6324b5fb2528ff5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT "FK_bccb82e01bb6324b5fb2528ff5a" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: evaluation FK_df167b6625e01d4e26b08b02ba2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT "FK_df167b6625e01d4e26b08b02ba2" FOREIGN KEY ("culturalContentId") REFERENCES public.cultural_content(id) ON DELETE CASCADE;


--
-- Name: gamification_achievements FK_gamification_achievements_achievements; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_achievements
    ADD CONSTRAINT "FK_gamification_achievements_achievements" FOREIGN KEY ("achievementId") REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: gamification_achievements FK_gamification_achievements_gamification; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_achievements
    ADD CONSTRAINT "FK_gamification_achievements_gamification" FOREIGN KEY ("gamificationId") REFERENCES public.gamification(id) ON DELETE CASCADE;


--
-- Name: gamification_missions FK_gamification_missions_gamification; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_missions
    ADD CONSTRAINT "FK_gamification_missions_gamification" FOREIGN KEY (gamification_id) REFERENCES public.gamification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vocabulary FK_vocabulary_topic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vocabulary
    ADD CONSTRAINT "FK_vocabulary_topic" FOREIGN KEY ("topicId") REFERENCES public.topic(id);


--
-- Name: gamification fk_gamification_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification
    ADD CONSTRAINT fk_gamification_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: statistics fk_statistics_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT fk_statistics_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tags tags_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.tags(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

