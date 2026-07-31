-- Progettazione Web 
DROP DATABASE if exists lucani_676340; 
CREATE DATABASE lucani_676340; 
USE lucani_676340; 
-- MySQL dump 10.13  Distrib 5.7.28, for Win64 (x86_64)
--
-- Host: localhost    Database: lucani_676340
-- ------------------------------------------------------
-- Server version	5.7.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articoli_lista`
--

DROP TABLE IF EXISTS `articoli_lista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `articoli_lista` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `gruppo_id` int(10) unsigned NOT NULL,
  `inserito_da` int(10) unsigned NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stato` enum('da_comprare','comprato') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'da_comprare',
  `acquirente_id` int(10) unsigned DEFAULT NULL,
  `prezzo` decimal(10,2) DEFAULT NULL,
  `data_acquisto` date DEFAULT NULL,
  `creato_il` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_articoli_inserito_da` (`inserito_da`),
  KEY `fk_articoli_acquirente` (`acquirente_id`),
  KEY `idx_articoli_gruppo_stato` (`gruppo_id`,`stato`),
  CONSTRAINT `fk_articoli_acquirente` FOREIGN KEY (`acquirente_id`) REFERENCES `utenti` (`id`),
  CONSTRAINT `fk_articoli_gruppo` FOREIGN KEY (`gruppo_id`) REFERENCES `gruppi` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_articoli_inserito_da` FOREIGN KEY (`inserito_da`) REFERENCES `utenti` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articoli_lista`
--

LOCK TABLES `articoli_lista` WRITE;
/*!40000 ALTER TABLE `articoli_lista` DISABLE KEYS */;
INSERT INTO `articoli_lista` VALUES (1,1,3,'Latte','da_comprare',NULL,NULL,NULL,'2026-07-19 14:19:29'),(2,1,2,'Detersivo','da_comprare',NULL,NULL,NULL,'2026-07-19 14:19:29'),(3,1,2,'Pane','comprato',2,9.00,'2026-07-10','2026-07-19 14:19:29'),(4,1,3,'Acqua','comprato',3,6.00,'2026-07-12','2026-07-19 14:19:29'),(5,2,2,'Crema solare','da_comprare',NULL,NULL,NULL,'2026-07-19 14:19:29'),(6,2,3,'Cena ristorante','comprato',3,40.00,'2026-07-15','2026-07-19 14:19:29');
/*!40000 ALTER TABLE `articoli_lista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gruppi`
--

DROP TABLE IF EXISTS `gruppi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gruppi` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codice_invito` char(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creato_il` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gruppi_codice_invito` (`codice_invito`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gruppi`
--

LOCK TABLES `gruppi` WRITE;
/*!40000 ALTER TABLE `gruppi` DISABLE KEYS */;
INSERT INTO `gruppi` VALUES (1,'Coinquilini Pisa','ABC123','2026-07-19 14:19:29'),(2,'Vacanze Calabria','XYZ789','2026-07-19 14:19:29');
/*!40000 ALTER TABLE `gruppi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gruppo_utenti`
--

DROP TABLE IF EXISTS `gruppo_utenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gruppo_utenti` (
  `gruppo_id` int(10) unsigned NOT NULL,
  `utente_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`gruppo_id`,`utente_id`),
  KEY `fk_gruppo_utenti_utente` (`utente_id`),
  CONSTRAINT `fk_gruppo_utenti_gruppo` FOREIGN KEY (`gruppo_id`) REFERENCES `gruppi` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gruppo_utenti_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gruppo_utenti`
--

LOCK TABLES `gruppo_utenti` WRITE;
/*!40000 ALTER TABLE `gruppo_utenti` DISABLE KEYS */;
INSERT INTO `gruppo_utenti` VALUES (1,1),(1,2),(2,2),(1,3),(2,3);
/*!40000 ALTER TABLE `gruppo_utenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spesa_partecipanti`
--

DROP TABLE IF EXISTS `spesa_partecipanti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spesa_partecipanti` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `articolo_id` int(10) unsigned NOT NULL,
  `utente_id` int(10) unsigned NOT NULL,
  `quota` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partecipanti_articolo_utente` (`articolo_id`,`utente_id`),
  KEY `idx_partecipanti_utente` (`utente_id`),
  CONSTRAINT `fk_partecipanti_articolo` FOREIGN KEY (`articolo_id`) REFERENCES `articoli_lista` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_partecipanti_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spesa_partecipanti`
--

LOCK TABLES `spesa_partecipanti` WRITE;
/*!40000 ALTER TABLE `spesa_partecipanti` DISABLE KEYS */;
INSERT INTO `spesa_partecipanti` VALUES (1,3,1,3.00),(2,3,2,3.00),(3,3,3,3.00),(4,4,1,3.00),(5,4,3,3.00),(6,6,2,20.00),(7,6,3,20.00);
/*!40000 ALTER TABLE `spesa_partecipanti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utenti`
--

DROP TABLE IF EXISTS `utenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utenti` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creato_il` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_utenti_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti`
--

LOCK TABLES `utenti` WRITE;
/*!40000 ALTER TABLE `utenti` DISABLE KEYS */;
INSERT INTO `utenti` VALUES (1,'Ugo','ugo@email.com','$2b$10$fi/Qv9ZnwAnnaezRL6lBFufJ7JytZU7XBlzUW9wFOBTefEBAS39Ai','2026-07-19 14:19:29'),(2,'Luca','luca@email.com','$2b$10$nA0jq70v1bowGfn6f1JiyOOFv2LIHsbiFikTtGhP.rFoTe/GC8KD6','2026-07-19 14:19:29'),(3,'Sara','sara@email.com','$2b$10$JBPUFzi2be2ISxbBbIrdLOjcg0L3OcJFIIMbOrZdfXJnPPVbpNB/G','2026-07-19 14:19:29');
/*!40000 ALTER TABLE `utenti` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-19 16:19:56
