-- =====================================================================
-- SPLITTO - Schema del database (Versione Ottimizzata)
-- Motore: InnoDB
-- =====================================================================
DROP DATABASE IF EXISTS lucani_676340;
CREATE DATABASE IF NOT EXISTS lucani_676340 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lucani_676340;

-- ---------------------------------------------------------------------
-- 1. UTENTI
-- ---------------------------------------------------------------------
CREATE TABLE utenti (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    creato_il       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_utenti_email (email)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 2. GRUPPI
-- ---------------------------------------------------------------------
CREATE TABLE gruppi (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100)  NOT NULL,
    codice_invito   CHAR(6)       NOT NULL,
    creato_il       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_gruppi_codice_invito (codice_invito)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 3. GRUPPO_UTENTI (tabella ponte, relazione N:N)
-- Un utente può appartenere a più gruppi e un gruppo ha più membri.
-- La chiave primaria composita impedisce che lo stesso utente venga
-- inserito due volte nello stesso gruppo.
--
-- ON DELETE CASCADE su entrambe le FK: se un gruppo viene eliminato,
-- non ha senso mantenere righe di appartenenza "orfane"; allo stesso
-- modo, se un utente viene eliminato, la sua appartenenza ai gruppi
-- non ha più significato.
-- ---------------------------------------------------------------------
CREATE TABLE gruppo_utenti (
    gruppo_id   INT UNSIGNED NOT NULL,
    utente_id   INT UNSIGNED NOT NULL,

    PRIMARY KEY (gruppo_id, utente_id),

    CONSTRAINT fk_gruppo_utenti_gruppo
        FOREIGN KEY (gruppo_id) REFERENCES gruppi(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_gruppo_utenti_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 4. ARTICOLI_LISTA
-- I vincoli RESTRICT proteggono la cancellazione
-- ---------------------------------------------------------------------
CREATE TABLE articoli_lista (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    gruppo_id       INT UNSIGNED NOT NULL,
    inserito_da     INT UNSIGNED NOT NULL,
    nome            VARCHAR(150) NOT NULL,
    stato           ENUM('da_comprare', 'comprato') NOT NULL DEFAULT 'da_comprare',

    acquirente_id   INT UNSIGNED   NULL,
    prezzo          DECIMAL(10,2)  NULL,
    data_acquisto   DATE           NULL,

    creato_il       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_articoli_gruppo
        FOREIGN KEY (gruppo_id) REFERENCES gruppi(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_articoli_inserito_da
        FOREIGN KEY (inserito_da) REFERENCES utenti(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_articoli_acquirente
        FOREIGN KEY (acquirente_id) REFERENCES utenti(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_articoli_prezzo_positivo
        CHECK (prezzo IS NULL OR prezzo > 0),

    CONSTRAINT chk_articoli_coerenza_acquisto
        CHECK (
            (stato = 'da_comprare' AND acquirente_id IS NULL AND prezzo IS NULL AND data_acquisto IS NULL)
            OR
            (stato = 'comprato' AND acquirente_id IS NOT NULL AND prezzo IS NOT NULL AND data_acquisto IS NOT NULL)
        ),

    INDEX idx_articoli_gruppo_stato (gruppo_id, stato)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 6. SPESA_PARTECIPANTI 
-- Chi partecipa a una specifica spesa (articolo acquistato) e quanto
-- deve perché la suddivisione può coinvolgere solo un
-- sottoinsieme di membri
-- ---------------------------------------------------------------------
CREATE TABLE spesa_partecipanti (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    articolo_id     INT UNSIGNED   NOT NULL,
    utente_id       INT UNSIGNED    NOT NULL,
    quota           DECIMAL(10,2)   NOT NULL, 

    CONSTRAINT fk_partecipanti_articolo
        FOREIGN KEY (articolo_id) REFERENCES articoli_lista(id)
        ON DELETE CASCADE, 

    CONSTRAINT fk_partecipanti_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE RESTRICT, 

    CONSTRAINT uq_partecipanti_articolo_utente
        UNIQUE (articolo_id, utente_id), 

    CONSTRAINT chk_partecipanti_quota_positiva
        CHECK (quota > 0),

    INDEX idx_partecipanti_utente (utente_id)
) ENGINE=InnoDB;

-- =====================================================================
-- DATI DI TEST
-- Password per tutti gli utenti: "Nome2026?" (es. Ugo2026?, Luca2026?, Sara2026?)
-- Hash bcrypt generati tramite Bcrypt Hash Generator online, compatibili con password_verify() in PHP
-- =====================================================================

USE lucani_676340;

-- ---------------------------------------------------------------------
-- UTENTI
-- ---------------------------------------------------------------------
INSERT INTO utenti (nome, email, password_hash) VALUES
('Ugo',  'ugo@email.com',  '$2b$10$fi/Qv9ZnwAnnaezRL6lBFufJ7JytZU7XBlzUW9wFOBTefEBAS39Ai'),
('Luca', 'luca@email.com', '$2b$10$nA0jq70v1bowGfn6f1JiyOOFv2LIHsbiFikTtGhP.rFoTe/GC8KD6'),
('Sara', 'sara@email.com', '$2b$10$JBPUFzi2be2ISxbBbIrdLOjcg0L3OcJFIIMbOrZdfXJnPPVbpNB/G');
-- id 1 = Ugo, id 2 = Luca, id 3 = Sara

-- ---------------------------------------------------------------------
-- GRUPPI
-- ---------------------------------------------------------------------
INSERT INTO gruppi (nome, codice_invito) VALUES
('Coinquilini Pisa', 'ABC123'),
('Vacanze Calabria', 'XYZ789');
-- id 1 = Coinquilini Pisa, id 2 = Vacanze Calabria

-- ---------------------------------------------------------------------
-- GRUPPO_UTENTI
-- Coinquilini Pisa: Ugo, Luca, Sara (tutti e tre)
-- Vacanze Calabria: solo Luca e Sara
-- ---------------------------------------------------------------------
INSERT INTO gruppo_utenti (gruppo_id, utente_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3);

-- ---------------------------------------------------------------------
-- ARTICOLI_LISTA — Coinquilini Pisa (gruppo_id = 1)
-- ---------------------------------------------------------------------

-- Da comprare (nessun acquisto ancora)
INSERT INTO articoli_lista (gruppo_id, inserito_da, nome, stato) VALUES
(1, 3, 'Latte',       'da_comprare'),
(1, 2, 'Detersivo',   'da_comprare');

-- Comprati, con relative quote
INSERT INTO articoli_lista (gruppo_id, inserito_da, nome, stato, acquirente_id, prezzo, data_acquisto) VALUES
(1, 2, 'Pane',   'comprato', 2, 9.00, '2026-07-10'),  -- Luca paga, diviso in 3 (Ugo, Luca, Sara)
(1, 3, 'Acqua',  'comprato', 3, 6.00, '2026-07-12');  -- Sara paga, diviso tra Sara e Ugo

SET @id_pane  = (SELECT id FROM articoli_lista WHERE nome = 'Pane'  AND gruppo_id = 1);
SET @id_acqua = (SELECT id FROM articoli_lista WHERE nome = 'Acqua' AND gruppo_id = 1);

INSERT INTO spesa_partecipanti (articolo_id, utente_id, quota) VALUES
(@id_pane, 1, 3.00),  -- Ugo
(@id_pane, 2, 3.00),  -- Luca
(@id_pane, 3, 3.00),  -- Sara
(@id_acqua, 1, 3.00), -- Ugo
(@id_acqua, 3, 3.00); -- Sara

-- ---------------------------------------------------------------------
-- ARTICOLI_LISTA — Vacanze Calabria (gruppo_id = 2)
-- ---------------------------------------------------------------------

INSERT INTO articoli_lista (gruppo_id, inserito_da, nome, stato) VALUES
(2, 2, 'Crema solare', 'da_comprare');

INSERT INTO articoli_lista (gruppo_id, inserito_da, nome, stato, acquirente_id, prezzo, data_acquisto) VALUES
(2, 3, 'Cena ristorante', 'comprato', 3, 40.00, '2026-07-15'); -- Sara paga, divisa tra Luca e Sara

SET @id_cena = (SELECT id FROM articoli_lista WHERE nome = 'Cena ristorante' AND gruppo_id = 2);

INSERT INTO spesa_partecipanti (articolo_id, utente_id, quota) VALUES
(@id_cena, 2, 20.00), -- Luca
(@id_cena, 3, 20.00); -- Sara