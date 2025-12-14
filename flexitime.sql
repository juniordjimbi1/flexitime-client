-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 12 déc. 2025 à 14:46
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `flexitime`
--

-- --------------------------------------------------------

--
-- Structure de la table `day_closes`
--

CREATE TABLE `day_closes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `close_date` date NOT NULL,
  `total_minutes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `tasks_done` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `comment` varchar(255) DEFAULT NULL,
  `closed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `day_closes`
--

INSERT INTO `day_closes` (`id`, `user_id`, `close_date`, `total_minutes`, `tasks_done`, `comment`, `closed_at`) VALUES
(2, 11, '2025-09-27', 9, 2, 'Tâche : Implémentation d’un composant de barre de navigation responsive  Travail réalisé :  Développement de la barre de navigation responsive en HTML, CSS et JavaScript  Mise en place du logo, des liens de menu et du bouton hamburger  Gestion de l’affich', '2025-09-27 04:04:06'),
(3, 13, '2025-09-27', 3, 1, 'Tâche : Implémentation d’un composant de barre de navigation responsive  Travail réalisé :  Développement de la barre de navigation responsive en HTML, CSS et JavaScript  Mise en place du logo, des liens de menu et du bouton hamburger  Gestion de l’affich', '2025-09-27 12:30:23'),
(4, 11, '2025-10-04', 1, 0, 'J\'ai fini', '2025-10-04 13:55:20');

-- --------------------------------------------------------

--
-- Structure de la table `day_closes_bak_20250926`
--

CREATE TABLE `day_closes_bak_20250926` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `close_date` date NOT NULL,
  `total_minutes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `tasks_done` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `comment` varchar(255) DEFAULT NULL,
  `closed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `day_close_files`
--

CREATE TABLE `day_close_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `day_close_id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime` varchar(100) NOT NULL,
  `size` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `day_close_files`
--

INSERT INTO `day_close_files` (`id`, `day_close_id`, `filename`, `original_name`, `mime`, `size`, `created_at`) VALUES
(1, 2, '1758945846833__Document__2_.pdf', 'Document (2).pdf', 'application/pdf', 37115, '2025-09-27 04:04:06'),
(2, 3, '1758976224892__Document.pdf', 'Document.pdf', 'application/pdf', 91130, '2025-09-27 12:30:25'),
(3, 4, '1759586120255__Document.pdf', 'Document.pdf', 'application/pdf', 91130, '2025-10-04 13:55:20');

-- --------------------------------------------------------

--
-- Structure de la table `day_close_validations`
--

CREATE TABLE `day_close_validations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `day_close_id` bigint(20) UNSIGNED NOT NULL,
  `validator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `comment` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `decided_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `day_close_validations`
--

INSERT INTO `day_close_validations` (`id`, `day_close_id`, `validator_user_id`, `status`, `comment`, `created_at`, `decided_at`) VALUES
(1, 2, 10, 'APPROVED', NULL, '2025-09-27 02:41:00', '2025-09-27 04:50:42'),
(2, 3, 12, 'APPROVED', 'C\'est du bon boulot', '2025-09-27 12:30:25', '2025-09-27 12:31:21'),
(3, 4, 10, 'APPROVED', NULL, '2025-10-04 13:55:20', '2025-10-04 13:56:08');

-- --------------------------------------------------------

--
-- Structure de la table `departments`
--

CREATE TABLE `departments` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `departments`
--

INSERT INTO `departments` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Ingénierie', '2025-09-22 13:25:39', '2025-09-22 13:25:39'),
(2, 'Commercial', '2025-09-23 22:54:26', '2025-09-23 22:54:26'),
(3, 'Informatique', '2025-09-25 02:34:28', '2025-09-25 02:34:28'),
(4, 'Comptabilité', '2025-09-25 02:34:28', '2025-09-25 02:34:28'),
(5, 'Ressources humaines', '2025-09-25 02:34:28', '2025-09-25 02:34:28'),
(6, 'Marketing', '2025-09-25 02:34:28', '2025-09-25 02:34:28'),
(7, 'Opérations', '2025-09-25 02:34:28', '2025-09-25 02:34:28'),
(8, 'Delivery', '2025-11-15 03:56:54', '2025-11-15 03:56:54');

-- --------------------------------------------------------

--
-- Structure de la table `gdpr_deletions`
--

CREATE TABLE `gdpr_deletions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `target_user_id` bigint(20) UNSIGNED NOT NULL,
  `performed_by` bigint(20) UNSIGNED NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `labels`
--

CREATE TABLE `labels` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(64) NOT NULL,
  `color` varchar(16) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(48) NOT NULL,
  `title` varchar(160) NOT NULL,
  `body` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `creator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `manager_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `projects`
--

INSERT INTO `projects` (`id`, `name`, `code`, `description`, `status`, `start_date`, `end_date`, `created_by`, `manager_id`, `created_at`, `updated_at`) VALUES
(5, 'Projet Pilote FlexiTime', 'PILOTE-FT', 'Projet interne visant à tester le flux complet Projets → Tâches → Sessions de travail dans FlexiTime.', 'ACTIVE', NULL, '2025-11-30', 1, 14, '2025-11-15 04:28:02', '2025-11-15 06:04:11'),
(6, 'P1', NULL, NULL, 'ACTIVE', NULL, '2025-11-28', 1, 14, '2025-11-21 20:49:14', '2025-11-24 09:43:34');

-- --------------------------------------------------------

--
-- Structure de la table `project_members`
--

CREATE TABLE `project_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('MANAGER','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `added_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `project_members`
--

INSERT INTO `project_members` (`id`, `project_id`, `user_id`, `role`, `added_by`, `created_at`) VALUES
(3, 5, 19, 'MEMBER', NULL, '2025-11-15 04:40:11'),
(4, 5, 18, 'MEMBER', NULL, '2025-11-15 04:40:11'),
(5, 5, 17, 'MEMBER', NULL, '2025-11-15 04:40:11'),
(6, 5, 16, 'MEMBER', NULL, '2025-11-15 04:40:11'),
(9, 6, 19, 'MEMBER', NULL, '2025-11-21 20:50:27'),
(10, 6, 18, 'MEMBER', NULL, '2025-11-21 20:50:27'),
(11, 6, 14, 'MEMBER', NULL, '2025-11-24 09:43:34');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `label` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `code`, `label`, `created_at`) VALUES
(1, 'ADMIN', 'Administrateur', '2025-09-22 11:45:58'),
(2, 'MANAGER', 'Chef d’équipe', '2025-09-22 11:45:58'),
(3, 'EMPLOYEE', 'Employé', '2025-09-22 11:45:58');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `task_id`, `start_time`, `end_time`, `duration_minutes`, `created_at`, `updated_at`) VALUES
(3, 11, NULL, '2025-09-27 02:34:46', '2025-09-27 02:39:51', 5, '2025-09-27 02:34:46', '2025-09-27 02:39:51'),
(4, 11, NULL, '2025-09-27 03:18:21', '2025-09-27 03:22:28', 4, '2025-09-27 03:18:21', '2025-09-27 03:22:28'),
(5, 13, NULL, '2025-09-27 12:26:33', '2025-09-27 12:29:42', 3, '2025-09-27 12:26:33', '2025-09-27 12:29:42'),
(6, 11, NULL, '2025-10-04 13:54:01', '2025-10-04 13:55:14', 1, '2025-10-04 13:54:01', '2025-10-04 13:55:14'),
(7, 19, 18, '2025-11-22 03:12:42', '2025-11-22 03:13:25', 0, '2025-11-22 03:12:42', '2025-11-22 03:13:25'),
(8, 19, 18, '2025-11-22 04:02:38', '2025-11-22 04:02:41', 0, '2025-11-22 04:02:38', '2025-11-22 04:02:41'),
(9, 19, 18, '2025-11-22 04:02:42', '2025-11-22 04:02:44', 0, '2025-11-22 04:02:42', '2025-11-22 04:02:44'),
(10, 19, 18, '2025-11-22 04:11:11', '2025-11-22 04:13:11', 2, '2025-11-22 04:11:11', '2025-11-22 04:13:11'),
(11, 19, 18, '2025-11-22 04:13:27', '2025-11-22 04:13:28', 0, '2025-11-22 04:13:27', '2025-11-22 04:13:28'),
(12, 18, 19, '2025-11-22 04:14:00', '2025-11-22 04:15:38', 1, '2025-11-22 04:14:00', '2025-11-22 04:15:38'),
(13, 18, 19, '2025-11-22 04:15:52', '2025-11-22 10:02:27', 346, '2025-11-22 04:15:52', '2025-11-22 10:02:27'),
(14, 18, 19, '2025-11-22 10:09:18', '2025-11-22 10:10:43', 1, '2025-11-22 10:09:18', '2025-11-22 10:10:43'),
(15, 18, 19, '2025-11-24 04:56:02', '2025-11-24 04:57:33', 1, '2025-11-24 04:56:02', '2025-11-24 04:57:33');

-- --------------------------------------------------------

--
-- Structure de la table `sessions_bak_20250926`
--

CREATE TABLE `sessions_bak_20250926` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `subdepartments`
--

CREATE TABLE `subdepartments` (
  `id` int(10) UNSIGNED NOT NULL,
  `department_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `subdepartments`
--

INSERT INTO `subdepartments` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES
(3, 3, 'Développeur FullStack', '2025-09-25 18:21:32', '2025-09-25 18:21:32'),
(5, 3, 'Ingénieur Cyber-Sécurité', '2025-09-27 12:20:18', '2025-09-27 12:20:18'),
(6, 7, 'Back Office', '2025-11-08 04:10:10', '2025-11-08 04:10:10'),
(7, 8, 'Équipe Projets', '2025-11-15 03:58:13', '2025-11-15 03:58:13'),
(8, 8, 'Général', '2025-11-15 04:04:25', '2025-11-15 04:04:25');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(160) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('TODO','IN_PROGRESS','DONE','BLOCKED') NOT NULL DEFAULT 'TODO',
  `priority` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  `team_id` int(10) UNSIGNED DEFAULT NULL,
  `created_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `status`, `priority`, `team_id`, `created_by_user_id`, `due_date`, `created_at`, `updated_at`) VALUES
(13, 5, 'Configurer le Kanban du projet', 'Configurer les colonnes TODO / IN_PROGRESS / BLOCKED / DONE et vérifier que le glisser-déposer fonctionne correctement.', 'TODO', 'HIGH', NULL, 1, '2025-11-20', '2025-11-15 05:03:02', '2025-11-15 05:03:02'),
(14, 5, 'Créer le backlog initial du projet', 'Lister 8 à 10 tâches réelles pour le projet pilote FlexiTime et les répartir dans les colonnes du Kanban.', 'TODO', 'MEDIUM', NULL, 1, '2025-11-22', '2025-11-15 05:27:48', '2025-11-15 05:27:48'),
(15, 5, 'Tester le suivi du temps par tâche', 'Démarrer et arrêter plusieurs sessions de travail sur une tâche, puis vérifier que les temps remontent correctement dans l’historique employé.', 'TODO', 'MEDIUM', NULL, 1, '2025-11-30', '2025-11-15 05:28:24', '2025-11-15 05:28:24'),
(16, 5, 'Vérifier les droits Manager / Employé sur le projet', 'Se connecter en Manager puis en Employé pour vérifier la visibilité des tâches, le changement de statut et l’enregistrement des sessions de travail.', 'TODO', 'LOW', NULL, 1, '2025-11-24', '2025-11-15 05:29:16', '2025-11-15 05:29:16'),
(17, 5, 'Documenter le scénario de test FlexiTime', 'Rédiger un court compte rendu du test : création d’équipe, ajout des membres au projet, création des tâches et vérification des rôles.', 'IN_PROGRESS', 'LOW', NULL, 1, '2025-11-25', '2025-11-15 05:30:00', '2025-11-24 04:21:01'),
(18, 6, 'front end', NULL, 'IN_PROGRESS', 'MEDIUM', NULL, 1, '2025-11-28', '2025-11-21 20:50:58', '2025-11-22 03:12:42'),
(19, 6, 'back end', NULL, 'IN_PROGRESS', 'MEDIUM', NULL, 1, '2025-11-28', '2025-11-21 20:51:16', '2025-11-24 04:16:17'),
(20, 6, 'Suivre la progression du projet', 'Suivre le projet à la trace et faire des rapports constament', 'BLOCKED', 'MEDIUM', NULL, 1, '2025-11-28', '2025-11-24 09:44:25', '2025-11-24 10:45:24');

-- --------------------------------------------------------

--
-- Structure de la table `tasks_bak_20250926`
--

CREATE TABLE `tasks_bak_20250926` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
  `priority` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  `team_id` int(10) UNSIGNED DEFAULT NULL,
  `created_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks_bak_20250926`
--

INSERT INTO `tasks_bak_20250926` (`id`, `title`, `description`, `status`, `priority`, `team_id`, `created_by_user_id`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 'Front-end de la page d\'acceuil de l\'application de gestion de tâches', 'Il faut un design ultra beau et attractive', 'DONE', 'MEDIUM', NULL, 3, NULL, '2025-09-22 23:07:13', '2025-09-23 23:34:13');

-- --------------------------------------------------------

--
-- Structure de la table `task_assignees`
--

CREATE TABLE `task_assignees` (
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_assignees`
--

INSERT INTO `task_assignees` (`task_id`, `user_id`, `assigned_at`, `created_at`, `updated_at`) VALUES
(14, 17, '2025-11-15 05:27:48', '2025-11-15 05:27:48', NULL),
(15, 16, '2025-11-15 05:28:24', '2025-11-15 05:28:24', NULL),
(15, 17, '2025-11-15 05:28:24', '2025-11-15 05:28:24', NULL),
(16, 16, '2025-11-15 05:29:16', '2025-11-15 05:29:16', NULL),
(16, 17, '2025-11-15 05:29:16', '2025-11-15 05:29:16', NULL),
(16, 18, '2025-11-15 05:29:16', '2025-11-15 05:29:16', NULL),
(17, 16, '2025-11-15 05:30:00', '2025-11-15 05:30:00', NULL),
(17, 17, '2025-11-15 05:30:00', '2025-11-15 05:30:00', NULL),
(17, 18, '2025-11-15 05:30:00', '2025-11-15 05:30:00', NULL),
(17, 19, '2025-11-15 05:30:00', '2025-11-15 05:30:00', NULL),
(18, 19, '2025-11-21 20:50:58', '2025-11-21 20:50:58', NULL),
(19, 18, '2025-11-21 20:51:16', '2025-11-21 20:51:16', NULL),
(20, 14, '2025-11-24 09:44:25', '2025-11-24 09:44:25', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `task_assignees_bak_20250926`
--

CREATE TABLE `task_assignees_bak_20250926` (
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `task_checklist_items`
--

CREATE TABLE `task_checklist_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `content` varchar(500) NOT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `is_done` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_checklist_items`
--

INSERT INTO `task_checklist_items` (`id`, `task_id`, `content`, `is_private`, `is_done`, `sort_order`, `created_by`, `created_at`, `updated_at`) VALUES
(3, 18, 'index.html', 0, 0, 0, 19, '2025-11-22 02:00:38', '2025-11-22 04:11:21'),
(4, 18, 'style.css', 0, 0, 1, 19, '2025-11-22 02:01:13', '2025-11-22 04:11:25'),
(9, 19, 'css', 0, 1, 0, 18, '2025-11-23 22:47:33', '2025-11-23 22:49:21'),
(10, 19, 'faire l\'inventaire', 0, 1, 1, 18, '2025-11-23 22:47:54', '2025-11-24 04:57:27'),
(11, 20, 'fga', 0, 0, 0, 14, '2025-11-24 10:45:08', '2025-11-24 10:45:08');

-- --------------------------------------------------------

--
-- Structure de la table `task_checklist_laps`
--

CREATE TABLE `task_checklist_laps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_checklist_item_id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime NOT NULL,
  `duration_seconds` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `task_checklist_time_logs`
--

CREATE TABLE `task_checklist_time_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `checklist_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `log_date` date NOT NULL,
  `minutes_spent` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `task_comments`
--

INSERT INTO `task_comments` (`id`, `task_id`, `user_id`, `body`, `created_at`) VALUES
(1, 19, 18, 'pas de css', '2025-11-23 22:48:40'),
(2, 19, 18, 'c\'est bon', '2025-11-24 04:19:16'),
(3, 20, 14, 'hjdklld', '2025-11-24 10:45:16'),
(4, 20, 14, '[BLOQUÉ] gdhofflkflmf', '2025-11-24 10:45:24');

-- --------------------------------------------------------

--
-- Structure de la table `task_label_links`
--

CREATE TABLE `task_label_links` (
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `label_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `task_plans`
--

CREATE TABLE `task_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `planned_date` date NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `teams`
--

CREATE TABLE `teams` (
  `id` int(10) UNSIGNED NOT NULL,
  `subdepartment_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `manager_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `teams`
--

INSERT INTO `teams` (`id`, `subdepartment_id`, `name`, `manager_user_id`, `created_at`, `updated_at`) VALUES
(7, 6, 'Alpha', 12, '2025-11-08 04:11:21', '2025-11-08 04:12:54'),
(9, 8, 'Équipe Pilote FlexiTime', 14, '2025-11-15 04:04:25', '2025-11-15 04:04:25'),
(12, 8, 'Équipe Pilote FT', 14, '2025-11-15 04:26:12', '2025-11-15 04:26:12');

-- --------------------------------------------------------

--
-- Structure de la table `teams_bak_20250926`
--

CREATE TABLE `teams_bak_20250926` (
  `id` int(10) UNSIGNED NOT NULL,
  `subdepartment_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `manager_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_closes`
--

CREATE TABLE `team_closes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `manager_user_id` bigint(20) UNSIGNED NOT NULL,
  `close_date` date NOT NULL,
  `members_total` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `members_submitted` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `tasks_done_total` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `total_minutes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `comment` varchar(255) DEFAULT NULL,
  `closed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_close_files`
--

CREATE TABLE `team_close_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `team_close_id` bigint(20) UNSIGNED NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `size` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `mime` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_close_validations`
--

CREATE TABLE `team_close_validations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `team_close_id` bigint(20) UNSIGNED NOT NULL,
  `validator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `comment` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `decided_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_members`
--

CREATE TABLE `team_members` (
  `team_id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_lead` tinyint(1) NOT NULL DEFAULT 0,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `team_members`
--

INSERT INTO `team_members` (`team_id`, `user_id`, `is_lead`, `joined_at`) VALUES
(7, 10, 0, '2025-11-08 06:37:46'),
(7, 11, 0, '2025-11-08 04:13:08'),
(7, 12, 0, '2025-11-08 06:37:46'),
(7, 13, 0, '2025-11-08 04:13:08'),
(12, 16, 0, '2025-11-15 04:26:12'),
(12, 17, 0, '2025-11-15 04:26:12'),
(12, 18, 0, '2025-11-15 04:26:12'),
(12, 19, 0, '2025-11-15 04:26:12');

-- --------------------------------------------------------

--
-- Structure de la table `team_members_bak_20250926`
--

CREATE TABLE `team_members_bak_20250926` (
  `team_id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_lead` tinyint(1) NOT NULL DEFAULT 0,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` tinyint(3) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `department_id` int(10) UNSIGNED DEFAULT NULL,
  `subdepartment_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `role_id`, `first_name`, `last_name`, `email`, `password_hash`, `is_active`, `department_id`, `subdepartment_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Super', 'Admin', 'admin@flexitime.local', '$2b$10$UTqjA8.BuUVtlvk5GTNS4.Up4YtYjeKeXeTI//7pi7Oh9Poa87WNW', 1, NULL, NULL, '2025-09-22 11:45:59', '2025-09-22 13:09:59'),
(10, 3, 'Achille Junior', 'Djimbi', 'djimbiachillejunior@icloud.com', '$2b$10$b7BUawRSazp27Dva9Nk/me/so61AnZvyBVo3BWg10NBBqZo.4X3C6', 1, 3, 3, '2025-09-26 23:58:47', '2025-11-14 19:12:42'),
(11, 3, 'ACH', 'Daj', 'djimbiachillejunior@gmail.com', '$2b$10$rYYbRbxaJg1BsbP5/ubp/eqxAFkw3hSSnDW/1ZKeQ4ACgUKFL72H2', 1, 3, NULL, '2025-09-27 02:02:12', '2025-10-04 13:48:58'),
(12, 2, 'Jerôme', 'Tsinga', 'Tsing@flexilocal.com', '$2b$10$RBfQ4MuWgxsSwXUuOP4.Q.3187OfrGmSyOJCpgJvSAl5Fd.8SYIpm', 1, 3, 5, '2025-09-27 12:20:19', '2025-09-27 12:23:09'),
(13, 3, 'Lvk', 'Djimbi', 'Lvk@flexilocal.com', '$2b$10$KKXvtq1i9N8Ui8.asEfa.uA9f5MFvJbJiTexCP.fcCFO9A6fUDMRK', 1, 3, NULL, '2025-09-27 12:22:27', '2025-09-27 12:22:27'),
(14, 2, 'Arnaud', 'Diabaté', 'arnaud.diabate@example.com', '$2b$10$UbEjSFDdx9byAtll3tL16eA0iD7kWtH4N0l6AiYo8dcuwm/vh2gZe', 1, 8, 7, '2025-11-15 03:58:13', '2025-11-15 04:02:32'),
(15, 2, 'Fatou', 'Sarr', 'fatou.sarr@example.com', '$2b$10$0.S7cqubxgv2A6Ukz48FOOXRHOXrWNqYy7CEOUSW/jdYLcazcR4Ju', 1, 8, 7, '2025-11-15 03:59:09', '2025-11-15 04:02:27'),
(16, 3, 'Moussa', 'Traoré', 'moussa.traore@example.com', '$2b$10$ISOeMy4lh7H8Z7Gv/yocnuZJOXIoSQ8rBjisNbVcCqOylarN3Eyhy', 1, 8, 7, '2025-11-15 03:59:52', '2025-11-15 03:59:52'),
(17, 3, 'Mariam', 'Konaté', 'mariam.konate@example.com', '$2b$10$WI.cj.Uj03bh8gYj/Re7KuSqJczoYUJI.cM0.VFCL/rUdMnNkUkbO', 1, 8, 7, '2025-11-15 04:00:28', '2025-11-15 04:00:28'),
(18, 3, 'Idriss', 'Diallo', 'idriss.diallo@example.com', '$2b$10$Se5i9O4l17iuOtYJCHaKy.14v9N0ienn34v7pw3RTPL8jlJFJmE2a', 1, 8, 7, '2025-11-15 04:01:08', '2025-11-15 04:01:08'),
(19, 3, 'Awa', 'Camara', 'awa.camara@example.com', '$2b$10$ClJk038IdWYk0tR3IJ2zG.cwdS8olkyHYBGW6ZIXlchtm1cUQLDrK', 1, 8, 7, '2025-11-15 04:01:52', '2025-11-15 04:01:52');

-- --------------------------------------------------------

--
-- Structure de la table `users_bak_20250926`
--

CREATE TABLE `users_bak_20250926` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` tinyint(3) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `department_id` int(10) UNSIGNED DEFAULT NULL,
  `subdepartment_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users_bak_20250926`
--

INSERT INTO `users_bak_20250926` (`id`, `role_id`, `first_name`, `last_name`, `email`, `password_hash`, `is_active`, `department_id`, `subdepartment_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Super', 'Admin', 'admin@flexitime.local', '$2b$10$UTqjA8.BuUVtlvk5GTNS4.Up4YtYjeKeXeTI//7pi7Oh9Poa87WNW', 1, NULL, NULL, '2025-09-22 11:45:59', '2025-09-22 13:09:59'),
(3, 2, 'Achille Junior', 'Djimbi', 'djimbiachillejunior@icloud.com', '$2b$10$Ftrlo5q82qoJGbbuFqRStOl9pXsL/GE7gWOy7V8V5z9eVu3028z.a', 1, NULL, NULL, '2025-09-22 22:32:00', '2025-09-22 22:45:18'),
(5, 2, 'Mady', 'Manager', 'manager@flexitime.local', '$2a$10$Q9SijqR1iFTq6m.tBTph0u5mXz0m5l9W8sYgV8gqJmI8wZCOh9L9C', 1, NULL, NULL, '2025-09-23 22:54:26', '2025-09-23 22:54:26'),
(8, 3, 'Ach', 'Daj', 'djimbiachillejunior@gmail.com', '$2b$10$ZqF1TkUHNK6p4dhTjMC9XeXPaa.wBejcDPD5MLyEcRoScw6owE1CK', 1, 3, 3, '2025-09-25 18:21:32', '2025-09-25 18:21:32'),
(9, 3, 'Ach', 'Daj', 'djimbiachillejunio@gmail.com', '$2b$10$u37Y2lPxSel3e3I23nftwOIofvNGysxcn5Pp9cm5WM50mMEjYKrsK', 1, 3, 3, '2025-09-25 18:22:00', '2025-09-25 18:22:00');

-- --------------------------------------------------------

--
-- Structure de la table `user_notifications`
--

CREATE TABLE `user_notifications` (
  `notification_id` bigint(20) UNSIGNED NOT NULL,
  `recipient_user_id` bigint(20) UNSIGNED NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_employee_daily_summary`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_employee_daily_summary` (
`user_id` bigint(20) unsigned
,`work_date` date
,`minutes_worked` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_employee_daily_summary`
--
DROP TABLE IF EXISTS `v_employee_daily_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_employee_daily_summary`  AS SELECT `s`.`user_id` AS `user_id`, cast(`s`.`start_time` as date) AS `work_date`, coalesce(sum(`s`.`duration_minutes`),0) AS `minutes_worked` FROM `sessions` AS `s` WHERE `s`.`end_time` is not null GROUP BY `s`.`user_id`, cast(`s`.`start_time` as date) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `day_closes`
--
ALTER TABLE `day_closes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_day_close_user_date` (`user_id`,`close_date`),
  ADD KEY `idx_day_close_user` (`user_id`);

--
-- Index pour la table `day_closes_bak_20250926`
--
ALTER TABLE `day_closes_bak_20250926`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_day_close_user_date` (`user_id`,`close_date`),
  ADD KEY `idx_day_close_user` (`user_id`);

--
-- Index pour la table `day_close_files`
--
ALTER TABLE `day_close_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dcf_close` (`day_close_id`);

--
-- Index pour la table `day_close_validations`
--
ALTER TABLE `day_close_validations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_dcv_close` (`day_close_id`),
  ADD KEY `idx_dcv_validator` (`validator_user_id`);

--
-- Index pour la table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_departments_name` (`name`);

--
-- Index pour la table `gdpr_deletions`
--
ALTER TABLE `gdpr_deletions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_target` (`target_user_id`),
  ADD KEY `fk_gdpr_actor` (`performed_by`);

--
-- Index pour la table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_label_name` (`name`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type_created` (`type`,`created_at`),
  ADD KEY `fk_notif_creator` (`creator_user_id`);

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_projects_code` (`code`),
  ADD KEY `idx_projects_status` (`status`),
  ADD KEY `idx_projects_manager` (`manager_id`),
  ADD KEY `idx_projects_created_by` (`created_by`);

--
-- Index pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_members` (`project_id`,`user_id`),
  ADD KEY `idx_pm_user` (`user_id`),
  ADD KEY `idx_pm_role` (`role`),
  ADD KEY `idx_pm_added_by` (`added_by`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_user_end` (`user_id`,`end_time`),
  ADD KEY `idx_sessions_task` (`task_id`);

--
-- Index pour la table `sessions_bak_20250926`
--
ALTER TABLE `sessions_bak_20250926`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_user_end` (`user_id`,`end_time`),
  ADD KEY `idx_sessions_task` (`task_id`);

--
-- Index pour la table `subdepartments`
--
ALTER TABLE `subdepartments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_subdep_name_per_dep` (`department_id`,`name`),
  ADD KEY `idx_subdep_dep` (`department_id`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_team` (`team_id`),
  ADD KEY `idx_tasks_creator` (`created_by_user_id`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_project_id` (`project_id`),
  ADD KEY `idx_tasks_project_status` (`project_id`,`status`);

--
-- Index pour la table `tasks_bak_20250926`
--
ALTER TABLE `tasks_bak_20250926`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_team` (`team_id`),
  ADD KEY `idx_tasks_creator` (`created_by_user_id`),
  ADD KEY `idx_tasks_status` (`status`);

--
-- Index pour la table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD PRIMARY KEY (`task_id`,`user_id`),
  ADD KEY `idx_ta_user` (`user_id`);

--
-- Index pour la table `task_assignees_bak_20250926`
--
ALTER TABLE `task_assignees_bak_20250926`
  ADD PRIMARY KEY (`task_id`,`user_id`),
  ADD KEY `idx_ta_user` (`user_id`);

--
-- Index pour la table `task_checklist_items`
--
ALTER TABLE `task_checklist_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tci_task` (`task_id`),
  ADD KEY `idx_tci_is_done` (`is_done`),
  ADD KEY `idx_tci_is_private` (`is_private`),
  ADD KEY `idx_tci_created_by` (`created_by`);

--
-- Index pour la table `task_checklist_laps`
--
ALTER TABLE `task_checklist_laps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_laps_item` (`task_checklist_item_id`),
  ADD KEY `idx_laps_task` (`task_id`),
  ADD KEY `idx_laps_user` (`user_id`),
  ADD KEY `idx_laps_session` (`session_id`);

--
-- Index pour la table `task_checklist_time_logs`
--
ALTER TABLE `task_checklist_time_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tctl_item` (`checklist_item_id`),
  ADD KEY `fk_tctl_user` (`user_id`),
  ADD KEY `fk_tctl_session` (`session_id`),
  ADD KEY `idx_tctl_task_date` (`task_id`,`log_date`);

--
-- Index pour la table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_comments_task_id_foreign` (`task_id`),
  ADD KEY `task_comments_user_id_foreign` (`user_id`);

--
-- Index pour la table `task_label_links`
--
ALTER TABLE `task_label_links`
  ADD PRIMARY KEY (`task_id`,`label_id`),
  ADD KEY `fk_tll_label` (`label_id`);

--
-- Index pour la table `task_plans`
--
ALTER TABLE `task_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_task_date` (`task_id`,`planned_date`),
  ADD KEY `idx_planned_date` (`planned_date`),
  ADD KEY `fk_tp_user` (`created_by`);

--
-- Index pour la table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_teams_name_per_subdep` (`subdepartment_id`,`name`),
  ADD KEY `idx_teams_subdep` (`subdepartment_id`),
  ADD KEY `idx_teams_manager` (`manager_user_id`);

--
-- Index pour la table `teams_bak_20250926`
--
ALTER TABLE `teams_bak_20250926`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_teams_name_per_subdep` (`subdepartment_id`,`name`),
  ADD KEY `idx_teams_subdep` (`subdepartment_id`),
  ADD KEY `idx_teams_manager` (`manager_user_id`);

--
-- Index pour la table `team_closes`
--
ALTER TABLE `team_closes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tc_day` (`team_id`,`close_date`),
  ADD KEY `idx_tc_team` (`team_id`),
  ADD KEY `idx_tc_mgr` (`manager_user_id`);

--
-- Index pour la table `team_close_files`
--
ALTER TABLE `team_close_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tcf_tc` (`team_close_id`);

--
-- Index pour la table `team_close_validations`
--
ALTER TABLE `team_close_validations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tcv_tc` (`team_close_id`),
  ADD KEY `idx_tcv_validator` (`validator_user_id`);

--
-- Index pour la table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`team_id`,`user_id`),
  ADD KEY `idx_tm_user` (`user_id`);

--
-- Index pour la table `team_members_bak_20250926`
--
ALTER TABLE `team_members_bak_20250926`
  ADD PRIMARY KEY (`team_id`,`user_id`),
  ADD KEY `idx_tm_user` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_department` (`department_id`),
  ADD KEY `idx_users_subdepartment` (`subdepartment_id`);

--
-- Index pour la table `users_bak_20250926`
--
ALTER TABLE `users_bak_20250926`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_department` (`department_id`),
  ADD KEY `idx_users_subdepartment` (`subdepartment_id`);

--
-- Index pour la table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`notification_id`,`recipient_user_id`),
  ADD KEY `idx_recipient_unread` (`recipient_user_id`,`is_read`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `day_closes`
--
ALTER TABLE `day_closes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `day_closes_bak_20250926`
--
ALTER TABLE `day_closes_bak_20250926`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `day_close_files`
--
ALTER TABLE `day_close_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `day_close_validations`
--
ALTER TABLE `day_close_validations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `gdpr_deletions`
--
ALTER TABLE `gdpr_deletions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `project_members`
--
ALTER TABLE `project_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `sessions_bak_20250926`
--
ALTER TABLE `sessions_bak_20250926`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `subdepartments`
--
ALTER TABLE `subdepartments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `tasks_bak_20250926`
--
ALTER TABLE `tasks_bak_20250926`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `task_checklist_items`
--
ALTER TABLE `task_checklist_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `task_checklist_laps`
--
ALTER TABLE `task_checklist_laps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `task_checklist_time_logs`
--
ALTER TABLE `task_checklist_time_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `task_plans`
--
ALTER TABLE `task_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `teams_bak_20250926`
--
ALTER TABLE `teams_bak_20250926`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `team_closes`
--
ALTER TABLE `team_closes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `team_close_files`
--
ALTER TABLE `team_close_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `team_close_validations`
--
ALTER TABLE `team_close_validations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `users_bak_20250926`
--
ALTER TABLE `users_bak_20250926`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `day_closes`
--
ALTER TABLE `day_closes`
  ADD CONSTRAINT `fk_day_close_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `day_close_files`
--
ALTER TABLE `day_close_files`
  ADD CONSTRAINT `fk_dcf_close` FOREIGN KEY (`day_close_id`) REFERENCES `day_closes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `day_close_validations`
--
ALTER TABLE `day_close_validations`
  ADD CONSTRAINT `fk_dcv_close` FOREIGN KEY (`day_close_id`) REFERENCES `day_closes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dcv_validator` FOREIGN KEY (`validator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `gdpr_deletions`
--
ALTER TABLE `gdpr_deletions`
  ADD CONSTRAINT `fk_gdpr_actor` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_gdpr_target` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_creator` FOREIGN KEY (`creator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_projects_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `fk_pm_added_by` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `subdepartments`
--
ALTER TABLE `subdepartments`
  ADD CONSTRAINT `fk_subdep_dep` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tasks_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD CONSTRAINT `fk_ta_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_checklist_items`
--
ALTER TABLE `task_checklist_items`
  ADD CONSTRAINT `fk_tci_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tci_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `task_checklist_laps`
--
ALTER TABLE `task_checklist_laps`
  ADD CONSTRAINT `fk_laps_item` FOREIGN KEY (`task_checklist_item_id`) REFERENCES `task_checklist_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_laps_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_laps_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_laps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `task_checklist_time_logs`
--
ALTER TABLE `task_checklist_time_logs`
  ADD CONSTRAINT `fk_tctl_item` FOREIGN KEY (`checklist_item_id`) REFERENCES `task_checklist_items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tctl_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tctl_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tctl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `task_comments_task_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_comments_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_label_links`
--
ALTER TABLE `task_label_links`
  ADD CONSTRAINT `fk_tll_label` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tll_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_plans`
--
ALTER TABLE `task_plans`
  ADD CONSTRAINT `fk_tp_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tp_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `fk_teams_manager` FOREIGN KEY (`manager_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_teams_subdep` FOREIGN KEY (`subdepartment_id`) REFERENCES `subdepartments` (`id`);

--
-- Contraintes pour la table `team_closes`
--
ALTER TABLE `team_closes`
  ADD CONSTRAINT `fk_tc_manager` FOREIGN KEY (`manager_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tc_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `team_close_files`
--
ALTER TABLE `team_close_files`
  ADD CONSTRAINT `fk_tcf_tc` FOREIGN KEY (`team_close_id`) REFERENCES `team_closes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `team_close_validations`
--
ALTER TABLE `team_close_validations`
  ADD CONSTRAINT `fk_tcv_tc` FOREIGN KEY (`team_close_id`) REFERENCES `team_closes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tcv_validator` FOREIGN KEY (`validator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_subdepartment` FOREIGN KEY (`subdepartment_id`) REFERENCES `subdepartments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Contraintes pour la table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD CONSTRAINT `fk_un_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_un_user` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
