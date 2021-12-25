create database db;
use db;

CREATE TABLE `hashes` (
  `id` int NOT NULL,
  `hash` varchar(64) NOT NULL,
  `raw_input` varchar(5000) DEFAULT NULL,
  `date_submitted` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_verified` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `hashes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hashes` (`hash`);

ALTER TABLE `hashes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

UPDATE mysql.user SET authentication_string=PASSWORD('ccrnjuhnuyrkceghisncuyrsgheknc') WHERE User='root';
FLUSH PRIVILEGES;